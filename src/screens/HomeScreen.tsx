import { useMemo, useState } from "react";
import type { Intensity, Tool } from "../types";
import { useAppData } from "../state/AppDataContext";
import { ScreenHeader } from "../components/ui";
import { recommendTools } from "../lib/recommend";

const MOOD_OPTIONS: { level: Intensity; label: string }[] = [
  { level: 1, label: "Calm" },
  { level: 2, label: "Stressed" },
  { level: 3, label: "Overwhelming" },
];

export function HomeScreen({
  onOpenTool,
  onStartGuided,
}: {
  onOpenTool: (tool: Tool) => void;
  onStartGuided: () => void;
}) {
  const { tools, favorites, addCheckIn, checkInsForDate, todayKeyStr } = useAppData();
  const [intensity, setIntensity] = useState<Intensity>(2);
  const [logged, setLogged] = useState(false);

  const recommended = useMemo(() => recommendTools(tools, intensity, favorites), [tools, intensity, favorites]);
  const todaysCheckIns = checkInsForDate(todayKeyStr);

  // Tapping a mood both selects it (driving the recommendations below) and
  // logs a check-in in one step — no separate slider + "Log" button, so
  // the whole screen stays short enough to fit without scrolling.
  const selectMood = (level: Intensity) => {
    setIntensity(level);
    addCheckIn({ intensity: level });
    setLogged(true);
    setTimeout(() => setLogged(false), 1500);
  };

  return (
    <div className="pb-24">
      <ScreenHeader title="How are you feeling?" subtitle="Tap a mood to check in." />

      <div className="px-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink-soft">Mood</p>
          {logged && (
            <span className="text-xs text-sage-text" aria-live="polite">
              Logged ✓
            </span>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.level}
              onClick={() => selectMood(opt.level)}
              aria-pressed={intensity === opt.level}
              className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${
                intensity === opt.level ? "bg-sage text-white" : "bg-surface/70 border border-line/10 text-ink-soft"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={onStartGuided}
          className="mt-4 w-full rounded-2xl bg-lavender text-white py-4 text-base font-medium shadow-sm active:opacity-90"
        >
          I need help now
        </button>

        <h2 className="mt-5 mb-2 text-sm font-medium text-ink-soft">Might help right now</h2>
        {recommended.length === 0 ? (
          <p className="text-sm text-ink-soft">Nothing tagged for this mood yet — browse the Toolkit.</p>
        ) : (
          // Horizontal scroll rather than a vertical list — no matter how
          // many tools are tagged for a mood, this row never grows the
          // screen's height, which is what keeps Home on one screen.
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
            {recommended.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onOpenTool(tool)}
                className="w-32 shrink-0 rounded-2xl bg-surface/70 border border-line/10 p-3 text-left shadow-sm active:scale-[0.97] transition-transform"
              >
                <span className="block text-sm font-medium leading-snug text-ink line-clamp-3">{tool.name}</span>
              </button>
            ))}
          </div>
        )}

        {todaysCheckIns.length > 0 && (
          <p className="mt-4 text-center text-xs text-ink-soft">
            {todaysCheckIns.length} check-in{todaysCheckIns.length === 1 ? "" : "s"} today
          </p>
        )}
      </div>
    </div>
  );
}
