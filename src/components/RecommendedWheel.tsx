import { useRef, useState } from "react";
import type { Tool } from "../types";

// A native iOS-picker-style wheel: a vertical reel of rows with scroll
// snap, the centered row emphasized and neighbors fading out by distance.
// Tapping any row opens it directly — the centering is just a visual focus
// aid while spinning/browsing, not a two-step "select then confirm".
const ROW_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const PAD_ROWS = Math.floor(VISIBLE_ROWS / 2);

export function RecommendedWheel({ tools, onOpen }: { tools: Tool[]; onOpen: (tool: Tool) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ROW_HEIGHT);
    setActiveIndex(Math.min(Math.max(idx, 0), tools.length - 1));
  };

  return (
    <div className="relative" style={{ height: ROW_HEIGHT * VISIBLE_ROWS }}>
      {/* Center-row rule lines, mimicking a native picker wheel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 z-10 border-y border-line/10"
        style={{ top: PAD_ROWS * ROW_HEIGHT, height: ROW_HEIGHT }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-paper to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-paper to-transparent"
      />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        role="listbox"
        aria-label="Might help right now — scroll to browse, tap to open"
        className="h-full overflow-y-auto"
        style={{ scrollSnapType: "y mandatory" }}
      >
        <div style={{ height: ROW_HEIGHT * PAD_ROWS }} />
        {tools.map((tool, i) => {
          const distance = Math.abs(i - activeIndex);
          const emphasis =
            distance === 0
              ? "text-base font-semibold text-ink opacity-100"
              : distance === 1
                ? "text-sm text-ink-soft opacity-60"
                : "text-sm text-ink-soft opacity-30";
          return (
            <button
              key={tool.id}
              role="option"
              aria-selected={i === activeIndex}
              onClick={() => onOpen(tool)}
              style={{ height: ROW_HEIGHT, scrollSnapAlign: "center" }}
              className={`flex w-full items-center justify-center px-8 text-center transition-all ${emphasis}`}
            >
              <span className="truncate">{tool.name}</span>
            </button>
          );
        })}
        <div style={{ height: ROW_HEIGHT * PAD_ROWS }} />
      </div>
    </div>
  );
}
