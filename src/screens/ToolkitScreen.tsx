import { useRef, useState, type TouchEvent } from "react";
import type { CategoryId, Tool } from "../types";
import { useAppData } from "../state/AppDataContext";
import { ToolCard } from "../components/ToolCard";
import { Pill, ScreenHeader } from "../components/ui";

const SWIPE_MIN_DISTANCE = 50;

export function ToolkitScreen({ onOpenTool }: { onOpenTool: (tool: Tool) => void }) {
  const { categories, toolsByCategory, favorites, tools, addCustomTool } = useAppData();
  const [activeCat, setActiveCat] = useState<CategoryId>(categories[0].id);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [addingName, setAddingName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const favoriteTools = tools.filter((t) => favorites.includes(t.id));
  const activeCategory = categories.find((c) => c.id === activeCat)!;
  const list = showFavOnly ? favoriteTools : toolsByCategory(activeCat);

  // Swiping left/right over the tool grid moves between category sections,
  // the same categories the pills above switch between — an alternative to
  // tapping a pill. Scoped to this content area (not the pill row, which
  // scrolls horizontally on its own) and skipped while viewing Favorites,
  // since that's a filter rather than a section in the category order.
  const handleTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || showFavOnly) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const currentIndex = categories.findIndex((c) => c.id === activeCat);
    const nextIndex = Math.min(Math.max(currentIndex + (dx < 0 ? 1 : -1), 0), categories.length - 1);
    if (nextIndex !== currentIndex) setActiveCat(categories[nextIndex].id);
  };

  return (
    <div className="pb-28">
      <ScreenHeader title="Toolkit" subtitle="Your coping tools, organized your way." />

      <div className="px-5">
        <div className="relative -mx-5">
          <div className="flex gap-2 overflow-x-auto pb-1 px-5">
            <Pill active={showFavOnly} onClick={() => setShowFavOnly((v) => !v)}>
              ★ Favorites
            </Pill>
            {categories.map((c) => (
              <Pill
                key={c.id}
                active={!showFavOnly && activeCat === c.id}
                onClick={() => {
                  setShowFavOnly(false);
                  setActiveCat(c.id);
                }}
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

        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {!showFavOnly && <p className="mt-3 text-xs text-ink-soft">{activeCategory.blurb}</p>}

          {list.length === 0 && (
            <p className="mt-6 text-center text-sm text-ink-soft">
              {showFavOnly ? "Pin a tool to see it here." : "Nothing here yet."}
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {list.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onOpen={onOpenTool} />
            ))}
          </div>

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
    </div>
  );
}
