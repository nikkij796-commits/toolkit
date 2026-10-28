import { useState } from "react";
import type { Intensity } from "../types";
import { useAppData } from "../state/AppDataContext";
import { useDialogA11y } from "../hooks/useDialogA11y";
import { useSwipeDismiss } from "../hooks/useSwipeDismiss";
import { Button } from "./ui";

// Coarse bucket for the required, app-wide `intensity` field — feeling logs
// don't drive recommendations or the Tracker, this just keeps the record
// internally consistent.
function bucketStrength(strength: number): Intensity {
  if (strength <= 2) return 1;
  if (strength <= 3) return 2;
  return 3;
}

export function LogFeelingSheet({ word, onClose }: { word: string; onClose: () => void }) {
  const { addCheckIn } = useAppData();
  const [strength, setStrength] = useState(3);
  const dialogRef = useDialogA11y(onClose);
  const swipeDown = useSwipeDismiss({ onDismiss: onClose, axis: "y", measureRef: dialogRef });

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Log feeling: ${word}`}
        tabIndex={-1}
        className="w-full max-w-md rounded-t-3xl bg-paper p-5 pb-8 outline-none"
        style={swipeDown.style}
        onTransitionEnd={swipeDown.onTransitionEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="-mx-5 -mt-5 flex justify-center px-5 pt-5 pb-4" {...swipeDown.handlers}>
          <div className="h-1.5 w-10 rounded-full bg-line/10" />
        </div>
        <h2 className="font-display text-lg font-semibold text-ink">Feeling {word.toLowerCase()}</h2>
        <p className="mt-1 text-sm text-ink-soft">How strong is it right now?</p>
        <div className="mt-4">
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={strength}
            onChange={(e) => setStrength(Number(e.target.value))}
            className="w-full accent-[var(--color-sage)] h-2"
            aria-label="Feeling strength"
            aria-valuetext={`${strength} out of 5`}
          />
          <div className="mt-3 flex items-center justify-between text-xs text-ink-soft">
            <span>1</span>
            <span>5</span>
          </div>
          <p className="mt-2 text-center text-lg font-medium text-ink">{strength} / 5</p>
        </div>
        <Button
          className="mt-5 w-full"
          onClick={() => {
            addCheckIn({ intensity: bucketStrength(strength), note: word, strength: strength as 1 | 2 | 3 | 4 | 5 });
            onClose();
          }}
        >
          Log this
        </Button>
      </div>
    </div>
  );
}
