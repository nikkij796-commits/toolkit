import { useState } from "react";
import { useAppData } from "../state/AppDataContext";
import { Button, Card, ConfirmDeleteButton, ScreenHeader } from "../components/ui";

const QUESTIONS: { key: "feeling" | "needsDecompress" | "decompressPlan" | "noTimeReasons"; label: string }[] = [
  { key: "feeling", label: "How are you feeling right now?" },
  { key: "needsDecompress", label: "Do you need time to decompress?" },
  { key: "decompressPlan", label: "What are you going to do to decompress?" },
  { key: "noTimeReasons", label: "If you don't have time for yourself, list out why?" },
];

const BLANK = { feeling: "", needsDecompress: "", decompressPlan: "", noTimeReasons: "" };

export function PostTherapyCheckInScreen({ onBack }: { onBack?: () => void }) {
  const { postTherapyCheckIns, addPostTherapyCheckIn, deletePostTherapyCheckIn } = useAppData();
  const [form, setForm] = useState(BLANK);

  const submit = () => {
    if (!Object.values(form).some((v) => v.trim())) return;
    addPostTherapyCheckIn(form);
    setForm(BLANK);
  };

  return (
    <div className="pb-10">
      <ScreenHeader
        title="Post-Therapy Check-In"
        subtitle="A few minutes with yourself before you move on."
        onBack={onBack}
        backLabel="More"
      />

      <div className="px-5">
        <Card className="p-4">
          {QUESTIONS.map((q, i) => {
            const fieldId = `pt-${q.key}`;
            return (
              <div key={q.key} className={i > 0 ? "mt-4" : ""}>
                <label htmlFor={fieldId} className="text-base font-medium text-ink">
                  {q.label}
                </label>
                <textarea
                  id={fieldId}
                  value={form[q.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [q.key]: e.target.value }))}
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-line/10 bg-surface/80 px-3 py-2.5 text-base"
                />
              </div>
            );
          })}
          <Button className="mt-4 w-full" onClick={submit}>
            Save check-in
          </Button>
        </Card>

        <div className="mt-6 space-y-3">
          {postTherapyCheckIns.length === 0 && (
            <p className="mt-6 text-center text-sm text-ink-soft">No check-ins yet.</p>
          )}
          {postTherapyCheckIns.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-ink-soft">
                  {new Date(c.createdAt).toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <ConfirmDeleteButton
                  onConfirm={() => deletePostTherapyCheckIn(c.id)}
                  className="text-xs"
                  aria-label="Delete check-in"
                />
              </div>
              <div className="mt-1.5 space-y-1.5">
                {QUESTIONS.map(
                  (q) =>
                    c[q.key] && (
                      <p key={q.key} className="text-sm text-ink">
                        <span className="font-medium text-ink-soft">{q.label} </span>
                        {c[q.key]}
                      </p>
                    ),
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
