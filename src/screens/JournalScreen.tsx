import { useState } from "react";
import type { JournalPrompt } from "../types";
import { useAppData } from "../state/AppDataContext";
import { Button, Card, ConfirmDeleteButton, Pill, ScreenHeader } from "../components/ui";
import { todayKey } from "../state/AppDataContext";
import {
  CBT_PROMPTS,
  THOUGHTS_ON_TRIAL_PROMPTS,
  GRATITUDE_PROMPTS,
  HONESTY_FRAMEWORK_PROMPTS,
} from "../data/toolkitData";

const SUGGESTED_TAGS = ["trigger", "tool used", "mood", "win", "hard day"];

type EntryType = "free" | "cbt" | "trial" | "gratitude" | "honesty";

const ENTRY_TYPES: { id: EntryType; label: string }[] = [
  { id: "free", label: "Free text" },
  { id: "cbt", label: "CBT" },
  { id: "trial", label: "Thoughts on trial" },
  { id: "gratitude", label: "Gratitude journal" },
  { id: "honesty", label: "Honesty Framework" },
];

const PROMPTS_BY_TYPE: Record<Exclude<EntryType, "free">, JournalPrompt[]> = {
  cbt: CBT_PROMPTS,
  trial: THOUGHTS_ON_TRIAL_PROMPTS,
  gratitude: GRATITUDE_PROMPTS,
  honesty: HONESTY_FRAMEWORK_PROMPTS,
};

export function JournalScreen() {
  const { journalEntries, addJournalEntry, deleteJournalEntry } = useAppData();
  const [entryType, setEntryType] = useState<EntryType>("free");
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const resetForm = () => {
    setEntryType("free");
    setText("");
    setTags([]);
    setCustomTag("");
    setAnswers({});
  };

  const submit = () => {
    if (entryType === "free") {
      if (!text.trim()) return;
      addJournalEntry({ date: todayKey(), text: text.trim(), tags });
    } else {
      const typeLabel = ENTRY_TYPES.find((t) => t.id === entryType)!.label;
      const prompts = PROMPTS_BY_TYPE[entryType];
      const body = prompts
        .filter((p) => answers[p.key]?.trim())
        .map((p) => `${p.label}: ${answers[p.key].trim()}`)
        .join("\n\n");
      addJournalEntry({
        date: todayKey(),
        text: body || `(${typeLabel} — no notes added)`,
        tags: [typeLabel],
      });
    }
    resetForm();
  };

  const structuredPrompts = entryType === "free" ? null : PROMPTS_BY_TYPE[entryType];

  return (
    <div className="pb-28">
      <ScreenHeader title="Journal" subtitle="Whatever's on your mind." />

      <div className="px-5">
        <Card className="p-4">
          <label htmlFor="journal-entry-type" className="text-xs font-medium text-ink-soft">
            Entry type
          </label>
          <select
            id="journal-entry-type"
            value={entryType}
            onChange={(e) => {
              setEntryType(e.target.value as EntryType);
              setAnswers({});
            }}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2.5 text-base text-ink"
          >
            {ENTRY_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          {entryType === "free" ? (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write freely..."
                aria-label="Journal entry"
                rows={4}
                className="mt-3 w-full resize-none bg-transparent text-base outline-none placeholder:text-ink-soft"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map((tag) => (
                  <Pill key={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)}>
                    {tag}
                  </Pill>
                ))}
                {tags
                  .filter((t) => !SUGGESTED_TAGS.includes(t))
                  .map((tag) => (
                    <Pill key={tag} active onClick={() => toggleTag(tag)}>
                      {tag}
                    </Pill>
                  ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customTag.trim()) {
                    toggleTag(customTag.trim());
                    setCustomTag("");
                  }
                }}
                className="mt-2"
              >
                <input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="+ custom tag"
                  aria-label="Add a custom tag"
                  className="w-full max-w-[160px] rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs"
                />
              </form>
            </>
          ) : (
            <div className="mt-4 space-y-4">
              {structuredPrompts!.map((p, i) => {
                const fieldId = `journal-${entryType}-${p.key}`;
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
                      className="mt-1.5 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2.5 text-base"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <Button
            className="mt-3 w-full"
            onClick={submit}
            disabled={entryType === "free" && !text.trim()}
          >
            Save entry
          </Button>
        </Card>

        <div className="mt-6 space-y-3">
          {journalEntries.length === 0 && (
            <p className="mt-6 text-center text-sm text-ink-soft">No entries yet.</p>
          )}
          {journalEntries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-ink-soft">
                  {new Date(entry.createdAt).toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <ConfirmDeleteButton
                  onConfirm={() => deleteJournalEntry(entry.id)}
                  className="text-xs"
                  aria-label="Delete entry"
                />
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-base text-ink">{entry.text}</p>
              {entry.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-lavender-soft px-2.5 py-1 text-xs text-ink-soft">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
