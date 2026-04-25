import { memo } from "react";
import { ITEM_W, useHorizontalStrip } from "@/hooks/use-horizontal-strip";

import { MONTH_NAMES, MONTH_SHORT, MONTHS } from "@/lib/constant";

export const MonthStrip = memo(function MonthStrip({
  month,
  maxMonth,
  onMonthChange,
  onMonthCommit
}: {
  month: number;
  maxMonth: number;
  onMonthChange: (m: number) => void;
  onMonthCommit: (m: number) => void;
}) {
  const { containerRef, offset, dragging, handlePointerDown, handlePointerMove, handlePointerUp, jumpTo, itemStyle } =
    useHorizontalStrip({
      count: 12,
      initialIndex: month,
      maxIndex: maxMonth,
      onIndex: onMonthChange,
      onCommit: onMonthCommit,
      commitDelay: 0
    });

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Select month"
      aria-valuenow={month + 1}
      aria-valuemin={1}
      aria-valuemax={maxMonth + 1}
      aria-valuetext={MONTH_NAMES[month]}
      tabIndex={0}
      className="relative overflow-hidden select-none outline-none"
      style={{ cursor: dragging ? "grabbing" : "grab" }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" && month > 0) jumpTo(month - 1);
        if (e.key === "ArrowRight" && month < maxMonth) jumpTo(month + 1);
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-journal-surface to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-journal-surface to-transparent z-10 pointer-events-none" />
      {/* <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gilt/25 pointer-events-none z-10" /> */}

      <div
        className="flex items-center"
        style={{ transform: `translateX(${offset}px)`, willChange: "transform", width: 12 * ITEM_W }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {MONTHS.map((m, idx) => {
          const isDisabled = m > maxMonth;
          return (
            <div
              key={m}
              onClick={() => !isDisabled && jumpTo(idx)}
              style={{
                ...itemStyle(idx, month),
                ...(isDisabled ? { opacity: 0.07, pointerEvents: "none" } : {})
              }}
              className="flex items-center justify-center py-1.5 shrink-0"
            >
              <span
                className={[
                  "text-sm tracking-wider transition-colors duration-150",
                  m === month ? "text-ink font-normal" : "text-ink-muted font-light"
                ].join(" ")}
              >
                {MONTH_SHORT[m]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
