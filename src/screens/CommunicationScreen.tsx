import { useState } from "react";
import { useAppData } from "../state/AppDataContext";
import { Card, ScreenHeader } from "../components/ui";
import { PLACEHOLDER_HOWTO } from "../data/toolkitData";
import type { Tool } from "../types";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  };

  return (
    <button
      onClick={copy}
      aria-live="polite"
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
        copied ? "bg-sage text-white" : "bg-sky-soft text-ink-soft"
      }`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ScriptCard({ tool, onEdit }: { tool: Tool; onEdit: (tool: Tool, text: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tool.howTo);
  const isPlaceholder = tool.howTo === PLACEHOLDER_HOWTO;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-ink">{tool.name}</span>
        {/* Copying the placeholder would silently put "Add your own notes
            on how you use this tool." on the clipboard instead of an
            actual script, so there's nothing useful to copy yet. */}
        {!editing && !isPlaceholder && <CopyButton text={tool.howTo} />}
      </div>
      {editing ? (
        <div className="mt-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-line/10 bg-surface/80 px-3 py-2 text-sm"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                onEdit(tool, draft);
                setEditing(false);
              }}
              className="rounded-full bg-sage text-white px-4 py-1.5 text-xs font-medium"
            >
              Save
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-ink-soft">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p
            className={`mt-1.5 whitespace-pre-wrap text-base leading-relaxed ${
              isPlaceholder ? "italic text-ink-faint" : "text-ink-soft"
            }`}
          >
            {tool.howTo}
          </p>
          <button onClick={() => setEditing(true)} className="mt-2 text-xs text-ink-soft">
            {isPlaceholder ? "Write a script" : "Edit script"}
          </button>
        </>
      )}
    </Card>
  );
}

export function CommunicationScreen() {
  const { toolsByCategory, updateTool } = useAppData();
  const scripts = toolsByCategory("communication");

  return (
    <div className="pb-28">
      <ScreenHeader title="Communication" subtitle="Scripts to pull up mid-conversation." />
      <div className="px-5 space-y-2">
        {scripts.map((tool) => (
          <ScriptCard key={tool.id} tool={tool} onEdit={(t, text) => updateTool(t.id, { howTo: text })} />
        ))}
      </div>
    </div>
  );
}
