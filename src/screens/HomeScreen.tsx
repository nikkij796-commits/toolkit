import { useEffect, useMemo, useState } from "react";
import type { Intensity, Tool } from "../types";
import { useAppData } from "../state/AppDataContext";
import { IntensitySlider, INTENSITY_LABELS } from "../components/IntensitySlider";
import { ToolCard } from "../components/ToolCard";
import { Button, Card, ScreenHeader } from "../components/ui";
import { recommendTools } from "../lib/recommend";

export function HomeScreen({
  onOpenTool,
  onStartGuided,
}: {
  onOpenTool: (tool: Tool) => void;
  onStartGuided: () => void;
}) {
  const { tools, favorites, addCheckIn, checkIns, checkInsForDate, todayKeyStr } = useAppData();
  const [intensity, setIntensity] = useState<Intensity>(2);
  const [logged, setLogged] = useState(false);
  const [showAllRecommended, setShowAllRecommended] = useState(false);

  const recommended = useMemo(() => recommendTools(tools, intensity, favorites), [tools, intensity, favorites]);
  const lastCheckIn = checkIns[0];
  const todaysCheckIns = checkInsForDate(todayKeyStr);

  // Collapse back to the short list whenever the mood changes, so "show
  // more" doesn't carry over to a differently-sized recommendation set.
  useEffect(() => setShowAllRecommended(false), [intensity]);

  const VISIBLE_RECOMMENDED = 6;
  const visibleRecommended = showAllRecommended ? recommended : recommended.slice(0, VISIBLE_RECOMMENDED);
  const hiddenRecommendedCount = recommended.length - visibleRecommended.length;

  return (
    <div className="pb-28">
      <ScreenHeader title="How are you feeling?" subtitle="A quick check-in, just for you." />

      <div className="px-5">
        <Card className="p-5">
          <IntensitySlider value={intensity} onChange={setIntensity} />
          <Button
            className="mt-5 w-full"
            variant={logged ? "secondary" : "primary"}
            aria-live="polite"
            onClick={() => {
              addCheckIn({ intensity });
              setLogged(true);
              setTimeout(() => setLogged(false), 2000);
            }}
          >
            {logged ? "Logged ✓" : "Log this check-in"}
          </Button>
        </Card>

        {lastCheckIn && (
          <p className="mt-3 text-center text-xs text-ink-soft">
            Last check-in {new Date(lastCheckIn.timestamp).toLocaleString([], {
              weekday: "short",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        )}

        <button
          onClick={onStartGuided}
          className="mt-6 w-full rounded-2xl bg-lavender text-white py-4 text-base font-medium shadow-sm active:opacity-90"
        >
          I need help now
        </button>

        <h2 className="mt-8 mb-3 text-sm font-medium text-ink-soft">
          Might help right now
        </h2>
        <div className="space-y-2">
          {visibleRecommended.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onOpen={onOpenTool} />
          ))}
        </div>
        {hiddenRecommendedCount > 0 ? (
          <button
            onClick={() => setShowAllRecommended(true)}
            className="mt-2 w-full rounded-xl py-2.5 text-center text-sm text-ink-soft active:bg-line/5"
          >
            Show {hiddenRecommendedCount} more
          </button>
        ) : (
          showAllRecommended &&
          recommended.length > VISIBLE_RECOMMENDED && (
            <button
              onClick={() => setShowAllRecommended(false)}
              className="mt-2 w-full rounded-xl py-2.5 text-center text-sm text-ink-soft active:bg-line/5"
            >
              Show less
            </button>
          )
        )}

        {todaysCheckIns.length > 0 && (
          <>
            <h2 className="mt-8 mb-3 text-sm font-medium text-ink-soft">Today</h2>
            <Card className="p-2">
              {todaysCheckIns.map((c, i) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 ${
                    i > 0 ? "border-t border-line/5" : ""
                  }`}
                >
                  <div>
                    <span className="text-sm text-ink">
                      {c.note ? c.note : INTENSITY_LABELS[c.intensity]}
                    </span>
                    {c.note && (
                      <span className="ml-2 text-xs text-ink-soft">
                        {c.strength ? `${c.strength}/5` : INTENSITY_LABELS[c.intensity]}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-ink-soft">
                    {new Date(c.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
