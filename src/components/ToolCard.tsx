import type { Tool } from "../types";
import { useAppData } from "../state/AppDataContext";

export function ToolCard({
  tool,
  onOpen,
  compact = false,
}: {
  tool: Tool;
  onOpen: (tool: Tool) => void;
  compact?: boolean;
}) {
  const { favorites, toggleFavorite } = useAppData();
  const isFav = favorites.includes(tool.id);

  return (
    <div
      className={`w-full rounded-2xl bg-surface/70 border border-line/10 shadow-sm flex items-center gap-2 ${
        compact ? "py-1 pl-3 pr-1" : "py-1 pl-4 pr-1.5"
      }`}
    >
      <button
        onClick={() => onOpen(tool)}
        className={`flex-1 text-left font-medium text-ink active:opacity-60 transition-opacity ${
          compact ? "py-2 text-sm" : "py-3 text-base"
        }`}
      >
        {tool.name}
      </button>
      <button
        onClick={() => toggleFavorite(tool.id)}
        aria-label={isFav ? "Unpin" : "Pin"}
        aria-pressed={isFav}
        className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-full text-lg leading-none active:bg-line/5 ${
          isFav ? "text-clay-text" : "text-ink-soft"
        }`}
      >
        {isFav ? "★" : "☆"}
      </button>
    </div>
  );
}
