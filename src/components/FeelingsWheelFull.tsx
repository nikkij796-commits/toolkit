import { useMemo, useState } from "react";
import type { FeelingColor } from "../types";
import { FEELINGS_WHEEL } from "../data/feelingsWheel";
import { donutSegmentPath, polarToCartesian, radialLabelTransform, splitAngle } from "../lib/wheelGeometry";
import { useDialogA11y } from "../hooks/useDialogA11y";
import { useSwipeDismiss } from "../hooks/useSwipeDismiss";
import { LogFeelingSheet } from "./LogFeelingSheet";

const FILL: Record<FeelingColor, string> = {
  sage: "var(--color-sage)",
  lavender: "var(--color-lavender)",
  clay: "var(--color-clay)",
  sky: "var(--color-sky)",
  rose: "var(--color-rose)",
  amber: "var(--color-amber)",
  slate: "var(--color-slate)",
};

const FILL_SOFT: Record<FeelingColor, string> = {
  sage: "var(--color-sage-soft)",
  lavender: "var(--color-lavender-soft)",
  clay: "var(--color-clay-soft)",
  sky: "var(--color-sky-soft)",
  rose: "var(--color-rose-soft)",
  amber: "var(--color-amber-soft)",
  slate: "var(--color-slate-soft)",
};

// Generous canvas + ring thickness so radially-running labels (which can run
// to 13+ characters) have enough physical room before they'd clip the edge.
const SIZE = 700;
const CENTER = SIZE / 2;

function OverviewWheel({ onPick }: { onPick: (coreName: string) => void }) {
  const slices = splitAngle(0, 360, FEELINGS_WHEEL.length, 2.5);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto max-w-md">
      {FEELINGS_WHEEL.map((core, i) => {
        const { start, end } = slices[i];
        const mid = (start + end) / 2;
        const labelPos = polarToCartesian(CENTER, CENTER, 225, mid);
        return (
          <g key={core.name} onClick={() => onPick(core.name)} className="cursor-pointer">
            <path
              d={donutSegmentPath(CENTER, CENTER, 120, 330, start, end)}
              fill={FILL[core.color]}
              stroke="var(--color-paper)"
              strokeWidth={3}
            />
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={26}
              fontWeight={600}
              fill="white"
              style={{ pointerEvents: "none" }}
            >
              {core.name}
            </text>
          </g>
        );
      })}
      <circle cx={CENTER} cy={CENTER} r={116} fill="var(--color-paper)" />
      <text
        x={CENTER}
        y={CENTER}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={19}
        fill="var(--color-ink-soft)"
      >
        Tap a feeling
      </text>
    </svg>
  );
}

function CoreWheel({ coreName, onBack, onPick }: { coreName: string; onBack: () => void; onPick: (w: string) => void }) {
  const core = FEELINGS_WHEEL.find((c) => c.name === coreName);
  if (!core) return null;

  const secSlices = splitAngle(0, 360, core.secondary.length, 1.5);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto max-w-md">
      {core.secondary.map((sec, i) => {
        const { start, end } = secSlices[i];
        const secMid = (start + end) / 2;
        const secLabel = radialLabelTransform(CENTER, CENTER, 105, secMid);
        const tertSlices = splitAngle(start, end, sec.tertiary.length, 1);

        return (
          <g key={sec.name}>
            <path
              d={donutSegmentPath(CENTER, CENTER, 95, 215, start, end)}
              fill={FILL[core.color]}
              stroke="var(--color-paper)"
              strokeWidth={2.5}
              className="cursor-pointer"
              onClick={() => onPick(sec.name)}
            />
            <text
              x={secLabel.x}
              y={secLabel.y}
              textAnchor={secLabel.anchor}
              dominantBaseline="middle"
              fontSize={16}
              fontWeight={600}
              fill="white"
              transform={`rotate(${secLabel.rotate} ${secLabel.x} ${secLabel.y})`}
              style={{ pointerEvents: "none" }}
            >
              {sec.name}
            </text>

            {sec.tertiary.map((word, j) => {
              const { start: ts, end: te } = tertSlices[j];
              const tMid = (ts + te) / 2;
              const tLabel = radialLabelTransform(CENTER, CENTER, 225, tMid);
              return (
                <g key={word}>
                  <path
                    d={donutSegmentPath(CENTER, CENTER, 215, 330, ts, te)}
                    fill={FILL_SOFT[core.color]}
                    stroke="var(--color-paper)"
                    strokeWidth={2}
                    className="cursor-pointer"
                    onClick={() => onPick(word)}
                  />
                  <text
                    x={tLabel.x}
                    y={tLabel.y}
                    textAnchor={tLabel.anchor}
                    dominantBaseline="middle"
                    fontSize={13}
                    fill="var(--color-ink)"
                    transform={`rotate(${tLabel.rotate} ${tLabel.x} ${tLabel.y})`}
                    style={{ pointerEvents: "none" }}
                  >
                    {word}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={93}
        fill={FILL[core.color]}
        className="cursor-pointer"
        onClick={onBack}
      />
      <text
        x={CENTER}
        y={CENTER - 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={20}
        fontWeight={600}
        fill="white"
        style={{ pointerEvents: "none" }}
      >
        {core.name}
      </text>
      <text
        x={CENTER}
        y={CENTER + 18}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={14}
        fill="white"
        style={{ pointerEvents: "none" }}
      >
        ‹ back
      </text>
    </svg>
  );
}

export function FeelingsWheelFull({ onClose }: { onClose: () => void }) {
  const [focusedCore, setFocusedCore] = useState<string | null>(null);
  const [logging, setLogging] = useState<string | null>(null);

  const title = useMemo(() => focusedCore ?? "Feelings wheel", [focusedCore]);
  const dialogRef = useDialogA11y(onClose);
  const swipeBack = useSwipeDismiss({ onDismiss: onClose, axis: "x", edgeZone: 28 });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Feelings wheel"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-paper outline-none"
      style={swipeBack.style}
      onTransitionEnd={swipeBack.onTransitionEnd}
      {...swipeBack.handlers}
    >
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        {focusedCore ? (
          <button onClick={() => setFocusedCore(null)} className="text-sm text-ink-soft">
            ‹ All feelings
          </button>
        ) : (
          <span className="text-sm text-ink-soft">Tap a core feeling to zoom in</span>
        )}
        <button onClick={onClose} className="text-sm text-ink-soft" aria-label="Close">
          Close
        </button>
      </div>

      <h1 className="font-display px-5 text-xl font-semibold text-ink">{title}</h1>

      <div className="flex-1 overflow-auto px-3 pb-8 flex items-start justify-center">
        {focusedCore ? (
          <CoreWheel coreName={focusedCore} onBack={() => setFocusedCore(null)} onPick={setLogging} />
        ) : (
          <OverviewWheel onPick={setFocusedCore} />
        )}
      </div>

      {logging && <LogFeelingSheet word={logging} onClose={() => setLogging(null)} />}
    </div>
  );
}
