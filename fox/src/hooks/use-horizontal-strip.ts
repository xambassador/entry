import { useCallback, useLayoutEffect, useRef, useState } from "react";

interface StripOptions {
  count: number;
  initialIndex: number;
  maxIndex?: number;
  onIndex: (idx: number) => void;
  onCommit: (idx: number) => void;
  commitDelay?: number;
  onTick?: () => void;
}

export const ITEM_W = 56;
const FRICTION = 0.88;
const SNAP_EASE = 0.18;

export function useHorizontalStrip(props: StripOptions) {
  const { count, initialIndex, maxIndex, onIndex, onCommit, commitDelay = 200, onTick } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSnappedRef = useRef(initialIndex);

  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const clampIdx = useCallback((idx: number) => Math.max(0, Math.min(maxIndex ?? count - 1, idx)), [count, maxIndex]);

  const offsetForIdx = useCallback((idx: number) => {
    const center = containerWidthRef.current / 2;
    return -(idx * ITEM_W - center + ITEM_W / 2);
  }, []);

  const idxFromOffset = useCallback(
    (off: number) => {
      const center = containerWidthRef.current / 2;
      const raw = Math.round((center - off - ITEM_W / 2) / ITEM_W);
      return clampIdx(raw);
    },
    [clampIdx]
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      containerWidthRef.current = el.offsetWidth;
      const init = offsetForIdx(initialIndex);
      offsetRef.current = init;
      setOffset(init);
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateTo = useCallback(
    (idx: number, instant = false) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const target = offsetForIdx(idx);
      if (instant) {
        offsetRef.current = target;
        setOffset(target);
        return;
      }
      function tick() {
        const diff = target - offsetRef.current;
        if (Math.abs(diff) < 0.4) {
          offsetRef.current = target;
          setOffset(target);
          return;
        }
        offsetRef.current += diff * SNAP_EASE;
        setOffset(offsetRef.current);
        rafRef.current = requestAnimationFrame(tick);
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [offsetForIdx]
  );

  function handlePointerDown(e: React.PointerEvent) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    isDraggingRef.current = true;
    setDragging(true);
    velocityRef.current = 0;
    lastXRef.current = e.clientX;
    lastTRef.current = performance.now();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    const dt = performance.now() - lastTRef.current;
    velocityRef.current = dt > 0 ? dx / dt : 0;
    lastXRef.current = e.clientX;
    lastTRef.current = performance.now();

    const minOff = offsetForIdx(clampIdx(count - 1));
    const maxOff = offsetForIdx(0);
    const next = offsetRef.current + dx;
    const clamped =
      next < minOff ? minOff + (next - minOff) * 0.2 : next > maxOff ? maxOff + (next - maxOff) * 0.2 : next;
    offsetRef.current = clamped;
    setOffset(clamped);

    const idx = idxFromOffset(clamped);
    if (idx !== lastSnappedRef.current) {
      lastSnappedRef.current = idx;
      onIndex(idx);
      onTick?.();
    }
  }

  function handlePointerUp() {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setDragging(false);

    const minOff = offsetForIdx(clampIdx(count - 1));
    const maxOff = offsetForIdx(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    function fling() {
      velocityRef.current *= FRICTION;
      const next = offsetRef.current + velocityRef.current * 16;
      const clamped = Math.max(minOff, Math.min(maxOff, next));
      offsetRef.current = clamped;
      setOffset(clamped);

      const idx = idxFromOffset(clamped);
      if (idx !== lastSnappedRef.current) {
        lastSnappedRef.current = idx;
        onIndex(idx);
        onTick?.();
      }

      if (Math.abs(velocityRef.current) > 0.05 && clamped === next) {
        rafRef.current = requestAnimationFrame(fling);
      } else {
        const snapped = idxFromOffset(clamped);
        animateTo(snapped);
        onIndex(snapped);
        if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
        commitTimerRef.current = setTimeout(() => onCommit(snapped), commitDelay);
      }
    }
    rafRef.current = requestAnimationFrame(fling);
  }

  const jumpTo = useCallback(
    (idx: number) => {
      if (isDraggingRef.current) return;
      const clamped = clampIdx(idx);
      animateTo(clamped);
      onIndex(clamped);
      onTick?.();
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
      commitTimerRef.current = setTimeout(() => onCommit(clamped), commitDelay);
    },
    [animateTo, clampIdx, commitDelay, onCommit, onIndex, onTick]
  );

  function itemStyle(idx: number, selectedIdx: number): React.CSSProperties {
    const dist = Math.abs(idx - selectedIdx);
    const opacity = dist === 0 ? 1 : dist === 1 ? 0.45 : dist === 2 ? 0.18 : 0.07;
    const scale = dist === 0 ? 1 : dist === 1 ? 0.88 : 0.78;
    return {
      width: ITEM_W,
      opacity,
      transform: `scale(${scale})`,
      transition: "opacity 0.2s ease, transform 0.2s ease"
    };
  }

  return {
    containerRef,
    offset,
    dragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    jumpTo,
    itemStyle
  };
}
