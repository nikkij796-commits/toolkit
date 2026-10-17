import { useState } from "react";
import type { Tool } from "../types";
import { useAppData, todayKey } from "../state/AppDataContext";
import { Button } from "./ui";

export function StructuredJournalForm({
  tool,
  onCancel,
  onSaved,
}: {
  tool: Tool;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { addJournalEntry, toggleDayTool, todayKeyStr, getDayLog } = useAppData();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const prompts = tool.journalPrompts ?? [];

  const submit = () => {
    const text = prompts
      .filter((p) => answers[p.key]?.trim())
      .map((p) => `${p.label}: ${answers[p.key].trim()}`)
      .join("\n\n");
    addJournalEntry({ date: todayKey(), text: text || `(${tool.name} — no notes added)`, tags: [tool.name] });
    if (!getDayLog(todayKeyStr).toolIds.includes(tool.id)) toggleDayTool(todayKeyStr, tool.id);
    onSaved();
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">{tool.name}</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {prompts.length}-step framework — logged to your journal when you save.
      </p>
      <div className="mt-5 space-y-4">
        {prompts.map((p, i) => {
          const fieldId = `${tool.id}-${p.key}`;
          return (
            <div key={p.key}>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sm font-semibold text-ink">
                  {i + 1}
                </span>
                <label htmlFor={fieldId} className="text-base font-medium text-ink">
                  {p.label}
                </label>
              </div>
              <textarea
                id={fieldId}
                value={answers[p.key] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [p.key]: e.target.value }))}
                placeholder={p.placeholder}
                rows={2}
                className="mt-1.5 w-full rounded-xl border border-line/10 bg-surface/80 px-3 py-2.5 text-base"
              />
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex gap-2">
        <Button onClick={submit}>Save entry</Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
