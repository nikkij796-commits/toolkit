import { useState } from "react";
import { useAppData } from "../state/AppDataContext";

function Bucket({ toolId, bucket }: { toolId: string; bucket: string }) {
  const { getToolListItems, addToolListItem, removeToolListItem } = useAppData();
  const [draft, setDraft] = useState("");
  const items = getToolListItems(toolId, bucket);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    addToolListItem(toolId, bucket, text);
    setDraft("");
  };

  return (
    <div>
      <p className="text-sm font-medium text-ink-soft">{bucket}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-sm text-ink-soft">Nothing added yet.</span>}
        {items.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft pl-3 pr-2 py-1.5 text-sm text-ink"
          >
            {item.text}
            <button
              onClick={() => removeToolListItem(toolId, bucket, item.id)}
              aria-label={`Remove ${item.text}`}
              className="flex h-5 w-5 items-center justify-center rounded-full text-ink-soft leading-none active:bg-line/10"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-2 flex gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Add to ${bucket.toLowerCase()}`}
          aria-label={`Add to ${bucket}`}
          className="flex-1 rounded-xl border border-line/10 bg-surface/80 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-xl bg-sage text-white px-4 text-sm font-medium disabled:opacity-40"
          disabled={!draft.trim()}
        >
          Add
        </button>
      </form>
    </div>
  );
}

export function ToolListBuckets({ toolId, buckets }: { toolId: string; buckets: string[] }) {
  return (
    <div className="mt-5 space-y-5">
      {buckets.map((bucket) => (
        <Bucket key={bucket} toolId={toolId} bucket={bucket} />
      ))}
    </div>
  );
}
