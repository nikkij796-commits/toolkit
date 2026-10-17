import type { Tool } from "../types";
import { useAppData } from "../state/AppDataContext";

export function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: (tool: Tool) => void }) {
  const { favorites, toggleFavorite } = useAppData();
  const isFav = favorites.includes(tool.id);

  return (
    <div className="relative rounded-2xl bg-surface/70 border border-line/10 shadow-sm">
      <button
        onClick={() => onOpen(tool)}
        className="flex w-full flex-col items-start gap-1 p-3 pr-9 text-left active:opacity-70 transition-opacity"
      >
        <span className="text-sm font-medium leading-snug text-ink">{tool.name}</span>
      </button>
      <button
        onClick={() => toggleFavorite(tool.id)}
        aria-label={isFav ? "Unpin" : "Pin"}
        aria-pressed={isFav}
        className={`absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-base leading-none active:bg-line/5 ${
          isFav ? "text-clay-text" : "text-ink-soft"
        }`}
      >
        {isFav ? "★" : "☆"}
      </button>
    </div>
  );
}
