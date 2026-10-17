import { useState } from "react";
import type { FeelingColor } from "../types";
import { FEELINGS_WHEEL } from "../data/feelingsWheel";
import { LogFeelingSheet } from "./LogFeelingSheet";
import { FeelingsWheelFull } from "./FeelingsWheelFull";
import { Card } from "./ui";

const COLOR_CLASSES: Record<FeelingColor, string> = {
  sage: "bg-sage-soft text-ink",
  lavender: "bg-lavender-soft text-ink",
  clay: "bg-clay-soft text-ink",
  sky: "bg-sky-soft text-ink",
  rose: "bg-rose-soft text-ink",
  amber: "bg-amber-soft text-ink",
  slate: "bg-slate-soft text-ink",
};

const COLOR_ACTIVE_CLASSES: Record<FeelingColor, string> = {
  sage: "bg-sage text-white",
  lavender: "bg-lavender text-white",
  clay: "bg-clay text-white",
  sky: "bg-sky text-white",
  rose: "bg-rose text-white",
  amber: "bg-amber text-white",
  slate: "bg-slate text-white",
};

export function FeelingsWheel() {
  const [openCore, setOpenCore] = useState<string | null>(null);
  const [openSecondary, setOpenSecondary] = useState<string | null>(null);
  const [logging, setLogging] = useState<string | null>(null);
  const [fullOpen, setFullOpen] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-ink">Feelings wheel</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Tap a feeling to narrow it down, or tap any word to log it.
          </p>
        </div>
        <button
          onClick={() => setFullOpen(true)}
          className="shrink-0 rounded-full bg-sage-soft px-3 py-1.5 text-sm font-medium text-ink whitespace-nowrap"
        >
          Open wheel
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FEELINGS_WHEEL.map((core) => {
          const active = openCore === core.name;
          return (
            <button
              key={core.name}
              onClick={() => {
                setOpenCore(active ? null : core.name);
                setOpenSecondary(null);
              }}
              className={`rounded-full px-4 py-2 text-base font-medium ${
                active ? COLOR_ACTIVE_CLASSES[core.color] : COLOR_CLASSES[core.color]
              }`}
            >
              {core.name}
            </button>
          );
        })}
      </div>

      {FEELINGS_WHEEL.filter((c) => c.name === openCore).map((core) => (
        <div key={core.name} className="mt-3 flex flex-wrap gap-2">
          {core.secondary.map((sec) => {
            const active = openSecondary === sec.name;
            return (
              <button
                key={sec.name}
                onClick={() => setOpenSecondary(active ? null : sec.name)}
                className={`rounded-full px-3.5 py-2 text-sm ${
                  active ? COLOR_ACTIVE_CLASSES[core.color] : "bg-surface/70 border border-line/10 text-ink-soft"
                }`}
              >
                {sec.name}
              </button>
            );
          })}
        </div>
      ))}

      {FEELINGS_WHEEL.filter((c) => c.name === openCore).flatMap((core) =>
        core.secondary
          .filter((s) => s.name === openSecondary)
          .map((sec) => (
            <div key={sec.name} className="mt-3 flex flex-wrap gap-2">
              {sec.tertiary.map((word) => (
                <button
                  key={word}
                  onClick={() => setLogging(word)}
                  className="rounded-full bg-paper-dim px-3.5 py-2 text-sm text-ink-soft border border-line/5"
                >
                  {word}
                </button>
              ))}
            </div>
          )),
      )}

      {logging && <LogFeelingSheet word={logging} onClose={() => setLogging(null)} />}
      {fullOpen && <FeelingsWheelFull onClose={() => setFullOpen(false)} />}
    </Card>
  );
}
