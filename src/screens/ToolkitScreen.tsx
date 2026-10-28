import { useEffect, useRef, useState, type TouchEvent } from "react";
import type { CategoryId, Tool } from "../types";
import { useAppData } from "../state/AppDataContext";
import { ToolCard } from "../components/ToolCard";
import { Pill, ScreenHeader } from "../components/ui";

const SWIPE_MIN_DISTANCE = 50;
const SLIDE_MS = 260;

export function ToolkitScreen({ onOpenTool }: { onOpenTool: (tool: Tool) => void }) {
  const { categories, toolsByCategory, favorites, tools, addCustomTool } = useAppData();
  const [activeCat, setActiveCat] = useState<CategoryId>(categories[0].id);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [addingName, setAddingName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pillRowRef = useRef<HTMLDivElement>(null);

  // Drives the slide-over transition between two category panels — the
  // pill row above never moves, only this content area does. `phase`
  // starts each transition pinned at its start position with no CSS
  // transition, then flips to "end" a frame later so the browser actually
  // animates between the two transform values instead of jumping.
  const [slide, setSlide] = useState<{ from: CategoryId; to: CategoryId; dir: 1 | -1 } | null>(null);
  const [phase, setPhase] = useState<"start" | "end">("start");

  const favoriteTools = tools.filter((t) => favorites.includes(t.id));
  const activeCategory = categories.find((c) => c.id === activeCat)!;

  useEffect(() => {
    if (!slide) return;
    const raf = requestAnimationFrame(() => setPhase("end"));
    return () => cancelAnimationFrame(raf);
  }, [slide]);

  // Keeps the newly-active pill in view in the horizontally-scrolling pill
  // strip — the strip itself never slides with the content (per design),
  // but on a long category name it can scroll several pills wide, so
  // without this the active pill can end up scrolled out of sight.
  const scrollPillIntoView = (id: string) => {
    const row = pillRowRef.current;
    const el = row?.querySelector<HTMLElement>(`[data-cat-id="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  };

  const goToCategory = (nextCat: CategoryId) => {
    if (slide) return;
    if (showFavOnly) {
      // Coming from Favorites, there's no on-screen category panel to
      // slide from, so just switch straight to it.
      setShowFavOnly(false);
      setActiveCat(nextCat);
      scrollPillIntoView(nextCat);
      return;
    }
    if (nextCat === activeCat) return;
    const fromIndex = categories.findIndex((c) => c.id === activeCat);
    const toIndex = categories.findIndex((c) => c.id === nextCat);
    setPhase("start");
    setSlide({ from: activeCat, to: nextCat, dir: toIndex > fromIndex ? 1 : -1 });
    scrollPillIntoView(nextCat);
  };

  const handleSlideEnd = () => {
    if (!slide) return;
    setActiveCat(slide.to);
    setSlide(null);
  };

  // Swiping left/right over the tool grid moves between category sections,
  // the same categories the pills above switch between — an alternative to
  // tapping a pill. Skipped while viewing Favorites, since that's a filter
  // rather than a section in the category order.
  const handleTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || slide) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const currentIndex = categories.findIndex((c) => c.id === activeCat);
    const nextIndex = Math.min(Math.max(currentIndex + (dx < 0 ? 1 : -1), 0), categories.length - 1);
    if (nextIndex !== currentIndex) goToCategory(categories[nextIndex].id);
  };

  const renderPanel = (catId: CategoryId) => {
    const cat = categories.find((c) => c.id === catId)!;
    const catTools = toolsByCategory(catId);
    return (
      <div key={catId} className="w-full shrink-0 px-5">
        <p className="mt-3 text-xs text-ink-soft">{cat.blurb}</p>
        {catTools.length === 0 && <p className="mt-6 text-center text-sm text-ink-soft">Nothing here yet.</p>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {catTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onOpen={onOpenTool} />
          ))}
        </div>
      </div>
    );
  };

  // While mid-slide, the moving track shows the "from" and "to" panels
  // side by side (ordered by swipe direction) and animates translateX
  // from showing one to showing the other; at rest it's just one panel.
  let trackChildren = [renderPanel(activeCat)];
  let trackTransform = "translateX(0%)";
  if (slide) {
    trackChildren = slide.dir === 1 ? [renderPanel(slide.from), renderPanel(slide.to)] : [renderPanel(slide.to), renderPanel(slide.from)];
    const atStart = slide.dir === 1 ? "0%" : "-100%";
    const atEnd = slide.dir === 1 ? "-100%" : "0%";
    trackTransform = `translateX(${phase === "start" ? atStart : atEnd})`;
  }

  return (
    <div className="pb-28">
      <ScreenHeader title="Toolkit" subtitle="Your coping tools, organized your way." />

      <div className="px-5">
        <div className="relative -mx-5">
          <div ref={pillRowRef} className="flex gap-2 overflow-x-auto pb-1 px-5">
            <Pill
              data-cat-id="favorites"
              active={showFavOnly}
              onClick={() => {
                setShowFavOnly((v) => !v);
                scrollPillIntoView("favorites");
              }}
            >
              ★ Favorites
            </Pill>
            {categories.map((c) => (
              <Pill
                key={c.id}
                data-cat-id={c.id}
                active={!showFavOnly && activeCat === c.id}
                onClick={() => goToCategory(c.id)}
              >
                {c.name}
              </Pill>
            ))}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-paper to-transparent"
          />
        </div>

        {showFavOnly ? (
          <div className="px-5">
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
          <div className="-mx-5 overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div
              className="flex"
              style={{
                transform: trackTransform,
                transition: slide && phase === "end" ? `transform ${SLIDE_MS}ms ease-out` : "none",
              }}
              onTransitionEnd={handleSlideEnd}
            >
              {trackChildren}
            </div>
          </div>
        )}

        {!showFavOnly && (
          <div className="mt-4">
            {showAdd ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (addingName.trim()) {
                    addCustomTool(activeCat, addingName.trim());
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
                + Add a tool to {activeCategory.name}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
