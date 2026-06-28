import { memo } from "react";

import { getDayWithFallback, getMonthNameWithFallback, getWeekdayWithFallback, getYearWithFallback } from "@/lib/date";

export const EntryDate = memo(function EntryDate(props: { date?: string }) {
  const { date } = props;
  const day = getDayWithFallback(date);
  const month = getMonthNameWithFallback(date);
  const year = getYearWithFallback(date);
  const weekday = getWeekdayWithFallback(date);
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-4xl font-semibold text-ink tabular-nums leading-none">{day}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm text-ink-secondary">{weekday},</span>
        <span className="text-sm text-ink-muted">
          {month} {year}
        </span>
      </div>
    </div>
  );
});
