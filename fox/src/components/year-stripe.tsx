import { memo } from "react";
import { ITEM_W, useHorizontalStrip } from "@/hooks/use-horizontal-strip";

import { CURRENT_YEAR, EARLIEST_YEAR, YEARS } from "@/lib/constant";

export const YearStrip = memo(function YearStrip({
  year,
  onYearChange,
  onCommit
}: {
  year: number;
  onYearChange: (y: number) => void;
  onCommit: (y: number) => void;
}) {
  const selectedIdx = year - EARLIEST_YEAR;
  const { containerRef, offset, dragging, handlePointerDown, handlePointerMove, handlePointerUp, jumpTo, itemStyle } =
    useHorizontalStrip({
      count: YEARS.length,
      initialIndex: selectedIdx,
      maxIndex: YEARS.length - 1,
      onIndex: (idx) => onYearChange(EARLIEST_YEAR + idx),
      onCommit: (idx) => onCommit(EARLIEST_YEAR + idx),
      commitDelay: 220
    });

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Select year"
      aria-valuenow={year}
      aria-valuemin={EARLIEST_YEAR}
      aria-valuemax={CURRENT_YEAR}
      tabIndex={0}
      className="relative overflow-hidden select-none outline-none"
      style={{ cursor: dragging ? "grabbing" : "grab" }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") jumpTo(selectedIdx - 1);
        if (e.key === "ArrowRight") jumpTo(selectedIdx + 1);
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-journal-surface to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-journal-surface to-transparent z-10 pointer-events-none" />
      {/* <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gilt/25 pointer-events-none z-10" /> */}

      <div
        className="flex items-center"
        style={{ transform: `translateX(${offset}px)`, willChange: "transform", width: YEARS.length * ITEM_W }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {YEARS.map((y, idx) => (
          <div
            key={y}
            onClick={() => jumpTo(idx)}
            style={itemStyle(idx, selectedIdx)}
            className="flex items-center justify-center py-1.5 shrink-0"
          >
            <span
              className={[
                "text-sm tabular-nums tracking-wider transition-colors duration-150",
                y === year ? "text-ink font-normal" : "text-ink-muted font-light"
              ].join(" ")}
            >
              {y}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
