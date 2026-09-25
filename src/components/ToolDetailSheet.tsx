import { useState } from "react";
import type { Intensity, Tool } from "../types";
import { useAppData } from "../state/AppDataContext";
import { useDialogA11y } from "../hooks/useDialogA11y";
import { Button } from "./ui";
import { StructuredJournalForm } from "./StructuredJournalForm";
import { ToolListBuckets } from "./ToolListBuckets";

const MOOD_CHIPS: { level: Intensity; label: string }[] = [
  { level: 1, label: "Calm" },
  { level: 2, label: "Stressed" },
  { level: 3, label: "Overwhelming" },
];

export function ToolDetailSheet({
  tool,
  onClose,
  onStartGuided,
  onOpenScreen,
}: {
  tool: Tool;
  onClose: () => void;
  onStartGuided?: (tool: Tool) => void;
  onOpenScreen?: (screenId: string) => void;
}) {
  const { favorites, toggleFavorite, updateTool, removeCustomTool, todayKeyStr, toggleDayTool, getDayLog, toolById } =
    useAppData();
  const liveTool = toolById(tool.id) ?? tool;
  const [editing, setEditing] = useState(false);
  const [logging, setLogging] = useState(false);
  const [draftName, setDraftName] = useState(liveTool.name);
  const [draftHowTo, setDraftHowTo] = useState(liveTool.howTo);

  const isFav = favorites.includes(liveTool.id);
  const usedToday = getDayLog(todayKeyStr).toolIds.includes(liveTool.id);
  const isCustom = "custom" in liveTool && (liveTool as { custom?: boolean }).custom;
  const moods = liveTool.moods ?? [];

  const toggleMood = (level: Intensity) => {
    const next = moods.includes(level) ? moods.filter((m) => m !== level) : [...moods, level].sort((a, b) => a - b);
    updateTool(liveTool.id, { moods: next });
  };

  const save = () => {
    updateTool(liveTool.id, { name: draftName.trim() || liveTool.name, howTo: draftHowTo });
    setEditing(false);
  };

  const dialogRef = useDialogA11y(onClose);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${liveTool.name} details`}
        tabIndex={-1}
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl bg-paper p-5 pb-8 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/10" />

        {editing ? (
          <div className="space-y-3">
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              aria-label="Tool name"
              className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-lg font-semibold"
            />
            <textarea
              value={draftHowTo}
              onChange={(e) => setDraftHowTo(e.target.value)}
              rows={5}
              aria-label="How you use this tool"
              className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm"
              placeholder="How do you use this tool?"
            />
            <div className="flex gap-2">
              <Button onClick={save}>Save</Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : logging ? (
          <StructuredJournalForm tool={liveTool} onCancel={() => setLogging(false)} onSaved={onClose} />
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold text-ink">{liveTool.name}</h2>
              <button
                onClick={() => toggleFavorite(liveTool.id)}
                className={`shrink-0 text-2xl leading-none ${isFav ? "text-clay" : "text-ink-soft"}`}
                aria-label={isFav ? "Unpin" : "Pin"}
                aria-pressed={isFav}
              >
                {isFav ? "★" : "☆"}
              </button>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-ink-soft">{liveTool.howTo}</p>

            {liveTool.listBuckets && <ToolListBuckets toolId={liveTool.id} buckets={liveTool.listBuckets} />}

            <p className="mt-5 text-sm font-medium text-ink-soft">Might help right now when feeling…</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MOOD_CHIPS.map((chip) => {
                const active = moods.includes(chip.level);
                return (
                  <button
                    key={chip.level}
                    onClick={() => toggleMood(chip.level)}
                    aria-pressed={active}
                    className={`rounded-full px-3 py-1.5 text-sm ${
                      active ? "bg-sage text-white" : "bg-white/70 border border-black/10 text-ink-soft"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {liveTool.opensScreen && onOpenScreen && (
                <Button onClick={() => onOpenScreen(liveTool.opensScreen!)}>Open {liveTool.name}</Button>
              )}
              {onStartGuided && (
                <Button onClick={() => onStartGuided(liveTool)}>Guided version</Button>
              )}
              {liveTool.journalPrompts && (
                <Button onClick={() => setLogging(true)}>Log entry</Button>
              )}
              <Button
                variant="secondary"
                onClick={() => toggleDayTool(todayKeyStr, liveTool.id)}
                aria-pressed={usedToday}
              >
                {usedToday ? "✓ Used today" : "Mark used today"}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </div>

            {isCustom && (
              <button
                onClick={() => {
                  removeCustomTool(liveTool.id);
                  onClose();
                }}
                className="mt-4 text-sm text-rust"
              >
                Remove this tool
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
