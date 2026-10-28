import type { ReactNode } from "react";
import { useSwipeDismiss } from "../hooks/useSwipeDismiss";

const EDGE_ZONE = 28; // px — matches iOS's left-edge interactive-pop hot zone

/**
 * Wraps a "pushed" screen (one reached from a list, with a "‹ Back" link)
 * with the native iOS edge-swipe-back gesture: dragging in from the left
 * edge slides this screen away in real time, revealing `background` (the
 * screen it was pushed from, already mounted underneath) — release past
 * the threshold completes the pop, release early springs it back.
 */
export function SwipeBackScreen({
  onBack,
  background,
  children,
}: {
  onBack: () => void;
  background: ReactNode;
  children: ReactNode;
}) {
  const swipe = useSwipeDismiss({ onDismiss: onBack, axis: "x", edgeZone: EDGE_ZONE });

  return (
    <div className="relative min-h-dvh">
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {background}
      </div>
      <div
        className="relative min-h-dvh bg-paper"
        style={swipe.style}
        onTransitionEnd={swipe.onTransitionEnd}
        {...swipe.handlers}
      >
        {children}
      </div>
    </div>
  );
}
