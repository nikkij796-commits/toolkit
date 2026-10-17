import { useState } from "react";
import { useAppData } from "../state/AppDataContext";
import { FeelingsWheel } from "../components/FeelingsWheel";
import { Button, Card, ConfirmDeleteButton, ScreenHeader } from "../components/ui";

export function ResourcesScreen() {
  const { resources, addResource, updateResource, deleteResource } = useAppData();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    addResource({ title: title.trim(), body: body.trim() });
    setTitle("");
    setBody("");
    setAdding(false);
  };

  return (
    <div className="pb-28">
      <ScreenHeader title="Resources" subtitle="Reference material, on your terms." />

      <div className="px-5 space-y-4">
        <FeelingsWheel />

        <div className="space-y-2">
          {resources.map((r) => (
            <ResourceCard
              key={r.id}
              title={r.title}
              body={r.body}
              onSave={(title, body) => updateResource(r.id, { title, body })}
              onDelete={() => deleteResource(r.id)}
            />
          ))}
        </div>

        {adding ? (
          <Card className="p-4">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              aria-label="Resource title"
              className="w-full rounded-xl border border-line/10 bg-surface/80 px-3 py-2 text-sm font-medium"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notes, a link, anything you want handy"
              aria-label="Resource notes"
              rows={3}
              className="mt-2 w-full rounded-xl border border-line/10 bg-surface/80 px-3 py-2 text-sm"
            />
            <div className="mt-2 flex gap-2">
              <Button onClick={submit}>Save</Button>
              <Button variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        ) : (
          <button onClick={() => setAdding(true)} className="text-sm text-ink-soft">
            + Add a resource
          </button>
        )}
      </div>
    </div>
  );
}

function ResourceCard({
  title,
  body,
  onSave,
  onDelete,
}: {
  title: string;
  body: string;
  onSave: (title: string, body: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftBody, setDraftBody] = useState(body);

  if (editing) {
    return (
      <Card className="p-4">
        <input
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          aria-label="Resource title"
          className="w-full rounded-xl border border-line/10 bg-surface/80 px-3 py-2 text-sm font-medium"
        />
        <textarea
          value={draftBody}
          onChange={(e) => setDraftBody(e.target.value)}
          aria-label="Resource notes"
          rows={3}
          className="mt-2 w-full rounded-xl border border-line/10 bg-surface/80 px-3 py-2 text-sm"
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              onSave(draftTitle.trim() || title, draftBody);
              setEditing(false);
            }}
            className="rounded-full bg-sage text-white px-4 py-1.5 text-xs font-medium"
          >
            Save
          </button>
          <button onClick={() => setEditing(false)} className="text-xs text-ink-soft">
            Cancel
          </button>
          <ConfirmDeleteButton onConfirm={onDelete} className="ml-auto text-xs" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-ink">{title}</span>
        <button onClick={() => setEditing(true)} className="shrink-0 text-xs text-ink-soft">
          Edit
        </button>
      </div>
      {body && <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink-soft">{body}</p>}
    </Card>
  );
}
