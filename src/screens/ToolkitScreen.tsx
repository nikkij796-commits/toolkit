import { useState } from "react";
import type { CategoryId, Tool } from "../types";
import { useAppData } from "../state/AppDataContext";
import { ToolCard } from "../components/ToolCard";
import { Pill, ScreenHeader } from "../components/ui";

export function ToolkitScreen({ onOpenTool }: { onOpenTool: (tool: Tool) => void }) {
  const { categories, toolsByCategory, favorites, tools, addCustomTool } = useAppData();
  const [activeCat, setActiveCat] = useState<CategoryId>(categories[0].id);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [addingName, setAddingName] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const favoriteTools = tools.filter((t) => favorites.includes(t.id));
  const activeCategory = categories.find((c) => c.id === activeCat)!;
  const list = showFavOnly ? favoriteTools : toolsByCategory(activeCat);

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
  );
}
