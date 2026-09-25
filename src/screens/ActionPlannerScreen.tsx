import { useState } from "react";
import type { ActionPlan } from "../types";
import { useAppData } from "../state/AppDataContext";
import { Button, Card, ConfirmDeleteButton, ScreenHeader } from "../components/ui";

const BLANK = { title: "", intention: "", values: "", behavior: "" };

export function ActionPlannerScreen() {
  const { actionPlans, addActionPlan, updateActionPlan, deleteActionPlan } = useAppData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);

  const startNew = () => {
    setEditingId(null);
    setForm(BLANK);
  };

  const startEdit = (plan: ActionPlan) => {
    setEditingId(plan.id);
    setForm({ title: plan.title, intention: plan.intention, values: plan.values, behavior: plan.behavior });
  };

  const submit = () => {
    if (!form.title.trim() && !form.intention.trim() && !form.values.trim() && !form.behavior.trim()) return;
    if (editingId) {
      updateActionPlan(editingId, form);
    } else {
      addActionPlan(form);
    }
    startNew();
  };

  return (
    <div className="pb-28">
      <ScreenHeader title="Action Planner" subtitle="Plan how you'll handle it, on your own terms." />

      <div className="px-5">
        <Card className="p-4">
          {editingId && <p className="mb-2 text-xs font-medium text-sage">Editing a saved plan</p>}

          <label htmlFor="planner-title" className="text-xs font-medium text-ink-soft">
            What's this about?
          </label>
          <input
            id="planner-title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Job interview, a hard conversation..."
            className="mt-1 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2.5 text-base"
          />

          <div className="mt-4">
            <label htmlFor="planner-intention" className="text-base font-medium text-ink">
              What is my intention?
            </label>
            <p className="text-xs text-ink-soft">What do I want, or how do I want to show up?</p>
            <textarea
              id="planner-intention"
              value={form.intention}
              onChange={(e) => setForm((f) => ({ ...f, intention: e.target.value }))}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2.5 text-base"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="planner-values" className="text-base font-medium text-ink">
              What are my values?
            </label>
            <p className="text-xs text-ink-soft">What matters to me here, no matter how it goes?</p>
            <textarea
              id="planner-values"
              value={form.values}
              onChange={(e) => setForm((f) => ({ ...f, values: e.target.value }))}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2.5 text-base"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="planner-behavior" className="text-base font-medium text-ink">
              What is my behavior?
            </label>
            <p className="text-xs text-ink-soft">What will I actually do — the part that's in my control?</p>
            <textarea
              id="planner-behavior"
              value={form.behavior}
              onChange={(e) => setForm((f) => ({ ...f, behavior: e.target.value }))}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2.5 text-base"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <Button className="flex-1" onClick={submit}>
              {editingId ? "Save changes" : "Save plan"}
            </Button>
            {editingId && (
              <Button variant="ghost" onClick={startNew}>
                Cancel
              </Button>
            )}
          </div>
        </Card>

        <div className="mt-6 space-y-3">
          {actionPlans.length === 0 && (
            <p className="mt-6 text-center text-sm text-ink-soft">No plans saved yet.</p>
          )}
          {actionPlans.map((plan) => (
            <Card key={plan.id} className="p-4">
              <button className="w-full text-left" onClick={() => startEdit(plan)}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-base font-medium text-ink">{plan.title || "Untitled plan"}</span>
                  <span className="shrink-0 text-xs text-ink-soft">
                    {new Date(plan.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
                {plan.intention && <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{plan.intention}</p>}
              </button>
              <div className="mt-2 flex justify-end">
                <ConfirmDeleteButton
                  onConfirm={() => {
                    if (editingId === plan.id) startNew();
                    deleteActionPlan(plan.id);
                  }}
                  className="text-xs"
                  aria-label="Delete plan"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
