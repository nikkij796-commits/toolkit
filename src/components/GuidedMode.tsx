import { useEffect, useMemo, useState } from "react";
import type { Intensity, Tool } from "../types";
import { useAppData } from "../state/AppDataContext";
import { useDialogA11y } from "../hooks/useDialogA11y";
import { recommendTools } from "../lib/recommend";
import { Button, Pill } from "./ui";

const FEELINGS: { label: string; intensity: Intensity }[] = [
  { label: "A little unsettled", intensity: 2 },
  { label: "Anxious", intensity: 2 },
  { label: "Not sure — just off", intensity: 2 },
  { label: "Racing thoughts", intensity: 3 },
  { label: "Overwhelmed", intensity: 3 },
  { label: "Panicky", intensity: 3 },
];

type Phase = "feeling" | "tool" | "timer" | "done";

export function GuidedMode({ onClose, startTool }: { onClose: () => void; startTool?: Tool }) {
  const { tools, favorites, toolsByCategory, addCheckIn, toggleDayTool, todayKeyStr, getDayLog } = useAppData();
  const [phase, setPhase] = useState<Phase>(startTool ? "timer" : "feeling");
  const [feeling, setFeeling] = useState<(typeof FEELINGS)[number] | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(startTool ?? null);

  const totalSeconds = selectedTool?.guidedSeconds ?? 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);

  const recommended = useMemo(
    () => recommendTools(tools, feeling?.intensity ?? 2, favorites),
    [tools, feeling, favorites],
  );

  useEffect(() => {
    if (phase !== "timer" || !running) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, running, secondsLeft]);

  const pickTool = (tool: Tool) => {
    setSelectedTool(tool);
    setSecondsLeft(tool.guidedSeconds ?? 60);
    setRunning(true);
    setPhase("timer");
  };

  const finish = (feltBetter: boolean) => {
    if (selectedTool) toggleDayToolIfNotAlready(selectedTool.id);
    addCheckIn({
      intensity: feeling?.intensity ?? 2,
      note: [feeling?.label, selectedTool?.name, feltBetter ? "felt better after" : undefined]
        .filter(Boolean)
        .join(" · "),
    });
    onClose();
  };

  const toggleDayToolIfNotAlready = (toolId: string) => {
    if (!getDayLog(todayKeyStr).toolIds.includes(toolId)) toggleDayTool(todayKeyStr, toolId);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(1, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 1;

  const dialogRef = useDialogA11y(onClose);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Guided coping session"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-paper outline-none"
    >
      <div className="flex items-center justify-between px-5 pt-6">
        <span className="text-sm text-ink-soft">
          {phase === "feeling" && "Step 1 of 3"}
          {phase === "tool" && "Step 2 of 3"}
          {(phase === "timer" || phase === "done") && "Step 3 of 3"}
        </span>
        <button onClick={onClose} className="text-sm text-ink-soft" aria-label="Close">
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {phase === "feeling" && (
          <div className="pt-8">
            <h2 className="text-xl font-semibold text-ink">What's going on right now?</h2>
            <p className="mt-1 text-sm text-ink-soft">Pick whatever's closest.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {FEELINGS.map((f) => (
                <Pill key={f.label} active={feeling?.label === f.label} onClick={() => setFeeling(f)}>
                  {f.label}
                </Pill>
              ))}
            </div>
            <Button className="mt-8 w-full" disabled={!feeling} onClick={() => setPhase("tool")}>
              Next
            </Button>
          </div>
        )}

        {phase === "tool" && (
          <div className="pt-8">
            <h2 className="text-xl font-semibold text-ink">Pick a tool</h2>
            <p className="mt-1 text-sm text-ink-soft">A few that might fit right now.</p>
            <div className="mt-5 space-y-2">
              {recommended.map((t) => (
                <button
                  key={t.id}
                  onClick={() => pickTool(t)}
                  className="w-full rounded-2xl bg-surface/70 border border-line/10 p-4 text-left text-ink font-medium active:scale-[0.99] transition-transform"
                >
                  {t.name}
                </button>
              ))}
            </div>
            <details className="mt-5">
              <summary className="text-sm text-ink-soft">See everything else</summary>
              <div className="mt-3 space-y-4">
                {["predicting", "identifying", "selfcare", "communication"].map((catId) => (
                  <div key={catId}>
                    <div className="grid grid-cols-2 gap-2">
                      {toolsByCategory(catId as Tool["categoryId"]).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => pickTool(t)}
                          className="rounded-xl bg-surface/60 border border-line/5 p-3 text-left text-sm text-ink"
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {phase === "timer" && selectedTool && (
          <div className="flex flex-col items-center pt-10 text-center">
            <h2 className="text-xl font-semibold text-ink">{selectedTool.name}</h2>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">{selectedTool.howTo}</p>

            <div className="relative mt-10 flex h-48 w-48 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full bg-sage-soft"
                style={{
                  transform: `scale(${0.85 + 0.15 * Math.sin(progress * Math.PI)})`,
                  transition: "transform 1s ease-in-out",
                }}
              />
              <span className="relative text-4xl font-semibold text-ink">
                {mm}:{ss}
              </span>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="secondary" onClick={() => setRunning((r) => !r)}>
                {running ? "Pause" : "Resume"}
              </Button>
              <Button variant="ghost" onClick={() => setPhase("done")}>
                I'm done
              </Button>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="flex flex-col items-center pt-16 text-center">
            <h2 className="text-xl font-semibold text-ink">Nice work</h2>
            <p className="mt-2 max-w-xs text-sm text-ink-soft">
              However that felt, you took a minute for yourself. That counts.
            </p>
            <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
              <Button onClick={() => finish(true)}>That helped</Button>
              <Button variant="secondary" onClick={() => setPhase("tool")}>
                Try another tool
              </Button>
              <Button variant="ghost" onClick={() => finish(false)}>
                Just exit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
