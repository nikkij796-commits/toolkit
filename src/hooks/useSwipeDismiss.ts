import { useRef, useState } from "react";
import type { RefObject, TouchEvent as ReactTouchEvent } from "react";

interface SwipeDismissOptions {
  /** Called once the drag is released past the commit threshold. */
  onDismiss: () => void;
  /** "x" drags rightward to dismiss — the iOS edge-swipe-back gesture.
   * "y" drags downward — the iOS pull-down-to-dismiss sheet gesture. */
  axis: "x" | "y";
  /** Touch must start within this many px of the element's leading edge
   * (left for "x", top for "y") to begin tracking — mirrors iOS's
   * edge-anchored interactive-pop gesture so it never competes with a
   * screen's own scrolling or swipe gestures elsewhere in the view. */
  edgeZone?: number;
  /** Fraction of the element's size that must be dragged past to commit
   * to dismissing, rather than springing back. */
  threshold?: number;
  disabled?: boolean;
  /** When the touch handlers are attached to a small drag handle rather
   * than the element that should actually slide away (e.g. a sheet's grab
   * bar), pass a ref to that larger element so distance/threshold are
   * measured against its real size instead of the tiny handle's. */
  measureRef?: RefObject<HTMLElement | null>;
}

// Drives a real-time, finger-following drag-to-dismiss: the dragged
// distance is mirrored 1:1 into a transform while the finger is down, then
// eases to fully open or fully dismissed on release, based on how far (or
// how fast) it was dragged — the same feel as iOS's interactive pop and
// sheet-dismiss gestures, rather than an instant threshold-triggered swap.
export function useSwipeDismiss({ onDismiss, axis, edgeZone, threshold = 0.3, disabled, measureRef }: SwipeDismissOptions) {
  const startRef = useRef<{ pos: number; size: number; time: number } | null>(null);
  const dismissingRef = useRef(false);
  const [offset, setOffset] = useState(0);
  const [settling, setSettling] = useState(false);

  const onTouchStart = (e: ReactTouchEvent<HTMLElement>) => {
    if (disabled || settling) return;
    const measureEl = measureRef?.current ?? e.currentTarget;
    const rect = measureEl.getBoundingClientRect();
    const size = axis === "x" ? rect.width : rect.height;
    const handleRect = e.currentTarget.getBoundingClientRect();
    const leading = axis === "x" ? handleRect.left : handleRect.top;
    const touchPos = axis === "x" ? e.touches[0].clientX : e.touches[0].clientY;
    if (edgeZone != null && touchPos - leading > edgeZone) return;
    startRef.current = { pos: touchPos, size, time: performance.now() };
  };

  const onTouchMove = (e: ReactTouchEvent<HTMLElement>) => {
    const start = startRef.current;
    if (!start) return;
    const cur = axis === "x" ? e.touches[0].clientX : e.touches[0].clientY;
    const delta = Math.max(0, cur - start.pos);
    setOffset(Math.min(delta, start.size));
  };

  const onTouchEnd = () => {
    const start = startRef.current;
    if (!start) return;
    startRef.current = null;
    const elapsed = Math.max(1, performance.now() - start.time);
    const velocity = offset / elapsed; // px/ms
    const commit = offset / start.size > threshold || velocity > 0.6;
    const target = commit ? start.size : 0;
    // If the drag already saturated at exactly the resting value we're
    // about to set (e.g. dragged past 100% before release), setOffset is a
    // same-value no-op — no transition fires, so onTransitionEnd never
    // runs. Resolve immediately instead of silently hanging.
    if (offset === target) {
      if (commit) onDismiss();
      return;
    }
    dismissingRef.current = commit;
    setSettling(true);
    setOffset(target);
  };

  const onTransitionEnd = () => {
    if (!settling) return;
    setSettling(false);
    if (dismissingRef.current) {
      dismissingRef.current = false;
      onDismiss();
    }
  };

  // Omitting the transform entirely at rest (rather than translate*(0))
  // matters: a non-"none" transform on an ancestor creates a new
  // containing block for any `position: fixed` descendant, which would
  // silently break fixed-positioned child dialogs/sheets even while idle.
  const transform =
    offset !== 0 || settling ? (axis === "x" ? `translateX(${offset}px)` : `translateY(${offset}px)`) : undefined;

  return {
    offset,
    style: { transform, transition: settling ? "transform 220ms ease-out" : "none" },
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    onTransitionEnd,
  };
}
