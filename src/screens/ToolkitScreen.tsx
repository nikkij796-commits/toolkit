import { useEffect, useRef, useState, type TouchEvent } from "react";
import type { Category, CategoryId, Tool } from "../types";
import { useAppData } from "../state/AppDataContext";
import { ToolCard } from "../components/ToolCard";
import { Pill, ScreenHeader } from "../components/ui";

const SLIDE_MS = 260;
const COMMIT_DISTANCE_FRACTION = 0.3; // drag past 30% of the page width...
const COMMIT_VELOCITY = 0.6; // ...or release at over 0.6px/ms, commits the page change.
const DEAD_ZONE = 8; // px of initial wiggle before a touch is read as a deliberate drag.

type Gesture = {
  x: number;
  y: number;
  time: number;
  locked: "pending" | "vertical" | "horizontal";
  dir?: 1 | -1;
  width?: number;
};

/**
 * One category's pills + blurb + tool grid + "add a tool" control — this is
 * the whole unit that slides as a single page, rather than a static pill
 * strip sitting above a separately-sliding grid. Each instance scrolls its
 * own copy of the pill row to keep its active pill in view (pill labels can
 * run wider than the screen).
 */
function CategoryPage({
  catId,
  categories,
  tools,
  onSelectCategory,
  onOpenTool,
  addCustomTool,
}: {
  catId: CategoryId;
  categories: Category[];
  tools: Tool[];
  onSelectCategory: (id: CategoryId) => void;
  onOpenTool: (tool: Tool) => void;
  addCustomTool: (categoryId: CategoryId, name: string) => void;
}) {
  const pillRowRef = useRef<HTMLDivElement>(null);
  const [addingName, setAddingName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const cat = categories.find((c) => c.id === catId)!;

  useEffect(() => {
    const row = pillRowRef.current;
    const el = row?.querySelector<HTMLElement>(`[data-cat-id="${catId}"]`);
    if (!row || !el) return;
    // Deliberately not scrollIntoView: `overflow: hidden` ancestors (like
    // the outer sliding track) still count as scrollable targets for it,
    // so it was also nudging the track's own scrollLeft — fighting the
    // live drag transform and compounding into a visible glitch on swipe.
    // Adjusting this row's scrollLeft directly touches only this element.
    const rowRect = row.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.left < rowRect.left) {
      row.scrollLeft -= rowRect.left - elRect.left;
    } else if (elRect.right > rowRect.right) {
      row.scrollLeft += elRect.right - rowRect.right;
    }
  }, [catId]);

  return (
    <div className="w-full shrink-0 px-5">
      <div className="relative -mx-5">
        <div ref={pillRowRef} className="flex gap-2 overflow-x-auto pb-1 px-5">
          {categories.map((c) => (
            <Pill key={c.id} data-cat-id={c.id} active={c.id === catId} onClick={() => onSelectCategory(c.id)}>
              {c.name}
            </Pill>
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-paper to-transparent"
        />
      </div>

      <p className="mt-3 text-xs text-ink-soft">{cat.blurb}</p>
      {tools.length === 0 && <p className="mt-6 text-center text-sm text-ink-soft">Nothing here yet.</p>}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onOpen={onOpenTool} />
        ))}
      </div>

      <div className="mt-4">
        {showAdd ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (addingName.trim()) {
                addCustomTool(catId, addingName.trim());
                setAddingName("");
                setShowAdd(false);
              }
            }}
            className="flex gap-2"
          >
            <input
              autoFocus
              value={addingName}
              onChange={(e) => setAddingName(e.target.value)}
              placeholder="New tool name"
              aria-label="New tool name"
              className="flex-1 rounded-xl border border-line/10 bg-surface/80 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-xl bg-sage text-white px-4 text-sm font-medium">
              Add
            </button>
          </form>
        ) : (
          <button onClick={() => setShowAdd(true)} className="text-sm text-ink-soft">
            + Add a tool to {cat.name}
          </button>
        )}
      </div>
    </div>
  );
}

export function ToolkitScreen({ onOpenTool }: { onOpenTool: (tool: Tool) => void }) {
  const { categories, toolsByCategory, favorites, tools, addCustomTool } = useAppData();
  const [activeCat, setActiveCat] = useState<CategoryId>(categories[0].id);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const activeIndex = categories.findIndex((c) => c.id === activeCat);

  const favoriteTools = tools.filter((t) => favorites.includes(t.id));

  const containerRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const commitRef = useRef(false);
  const justMountedRef = useRef(false);

  // `transition` means a second page (the one being swiped or tapped to) is
  // mounted alongside the current one and the two are sliding together as
  // one physical track — pills and grid move as a single unit, not a
  // static pill strip above a separately-animating grid. `dragX` is the
  // live offset while a touch is in progress; `settling` switches on the
  // eased CSS transition for the release/tap-triggered animation to its
  // resting position.
  const [transition, setTransition] = useState<{ target: CategoryId; dir: 1 | -1 } | null>(null);
  const [dragX, setDragX] = useState(0);
  const [settling, setSettling] = useState(false);

  // A tapped pill has no touchmove sequence to animate from, so the new
  // track mounts at dragX=0 with no transition first, then (next frame,
  // once the browser has actually painted that starting position) flips to
  // the commit position with the eased transition — otherwise there's
  // nothing for the browser to interpolate from and it would just jump.
  useEffect(() => {
    if (!transition || !justMountedRef.current) return;
    justMountedRef.current = false;
    const w = containerRef.current?.getBoundingClientRect().width ?? 0;
    const raf = requestAnimationFrame(() => {
      commitRef.current = true;
      setSettling(true);
      setDragX(transition.dir === 1 ? -w : w);
    });
    return () => cancelAnimationFrame(raf);
  }, [transition]);

  const goToCategory = (nextCat: CategoryId) => {
    if (transition || nextCat === activeCat) return;
    if (showFavOnly) {
      // Coming from Favorites there's no on-screen category page to slide
      // from, so just switch straight to it.
      setShowFavOnly(false);
      setActiveCat(nextCat);
      return;
    }
    const nextIndex = categories.findIndex((c) => c.id === nextCat);
    justMountedRef.current = true;
    setDragX(0);
    setSettling(false);
    setTransition({ target: nextCat, dir: nextIndex > activeIndex ? 1 : -1 });
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (transition || showFavOnly) return;
    const t = e.touches[0];
    gestureRef.current = { x: t.clientX, y: t.clientY, time: performance.now(), locked: "pending" };
  };

  const handleTouchMove = (e: TouchEvent) => {
    const g = gestureRef.current;
    if (!g || g.locked === "vertical") return;
    const t = e.touches[0];
    const dx = t.clientX - g.x;
    const dy = t.clientY - g.y;

    if (g.locked === "pending") {
      if (Math.abs(dx) < DEAD_ZONE && Math.abs(dy) < DEAD_ZONE) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.5) {
        g.locked = "vertical"; // a vertical scroll, not a page swipe — leave it alone
        return;
      }
      const dir: 1 | -1 = dx < 0 ? 1 : -1;
      const nextIndex = activeIndex + dir;
      if (nextIndex < 0 || nextIndex >= categories.length) {
        g.locked = "vertical"; // at the first/last category — nothing to swipe to
        return;
      }
      g.locked = "horizontal";
      g.dir = dir;
      g.width = containerRef.current?.getBoundingClientRect().width ?? 1;
      setTransition({ target: categories[nextIndex].id, dir });
    }

    if (g.locked !== "horizontal" || g.dir == null || g.width == null) return;
    const clamped = g.dir === 1 ? Math.max(-g.width, Math.min(0, dx)) : Math.min(g.width, Math.max(0, dx));
    setDragX(clamped);
  };

  const handleTouchEnd = () => {
    const g = gestureRef.current;
    gestureRef.current = null;
    if (!g || g.locked !== "horizontal" || g.dir == null || g.width == null) return;
    const elapsed = Math.max(1, performance.now() - g.time);
    const velocity = Math.abs(dragX) / elapsed;
    const commit = Math.abs(dragX) / g.width > COMMIT_DISTANCE_FRACTION || velocity > COMMIT_VELOCITY;
    commitRef.current = commit;
    setSettling(true);
    setDragX(commit ? (g.dir === 1 ? -g.width : g.width) : 0);
  };

  const handleSettled = () => {
    if (!settling) return;
    setSettling(false);
    if (commitRef.current && transition) {
      commitRef.current = false;
      setActiveCat(transition.target);
    }
    setTransition(null);
    setDragX(0);
  };

  const w = containerRef.current?.getBoundingClientRect().width ?? 0;
  const currentPage = (
    <CategoryPage
      key={activeCat}
      catId={activeCat}
      categories={categories}
      tools={toolsByCategory(activeCat)}
      onSelectCategory={goToCategory}
      onOpenTool={onOpenTool}
      addCustomTool={addCustomTool}
    />
  );
  let trackChildren = [currentPage];
  let trackTransform = 0;
  if (transition) {
    const targetPage = (
      <CategoryPage
        key={transition.target}
        catId={transition.target}
        categories={categories}
        tools={toolsByCategory(transition.target)}
        onSelectCategory={goToCategory}
        onOpenTool={onOpenTool}
        addCustomTool={addCustomTool}
      />
    );
    trackChildren = transition.dir === 1 ? [currentPage, targetPage] : [targetPage, currentPage];
    trackTransform = transition.dir === 1 ? dragX : dragX - w;
  }

  return (
    <div className="pb-28">
      <ScreenHeader title="Toolkit" subtitle="Your coping tools, organized your way." />

      <div className="px-5">
        <Pill
          active={showFavOnly}
          onClick={() => {
            if (transition) return;
            setShowFavOnly((v) => !v);
          }}
        >
          ★ Favorites
        </Pill>
      </div>

      {showFavOnly ? (
        <div className="px-5 mt-4">
          {favoriteTools.length === 0 && (
            <p className="mt-6 text-center text-sm text-ink-soft">Pin a tool to see it here.</p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {favoriteTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onOpen={onOpenTool} />
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="mt-4 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex"
            style={{
              transform: `translateX(${trackTransform}px)`,
              transition: settling ? `transform ${SLIDE_MS}ms ease-out` : "none",
            }}
            onTransitionEnd={handleSettled}
          >
            {trackChildren}
          </div>
        </div>
      )}
    </div>
  );
}
