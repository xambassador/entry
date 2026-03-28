import { memo } from "react";

import { getDayWithFallback, getMonthNameWithFallback, getWeekdayWithFallback, getYearWithFallback } from "@/lib/date";

export const EntryDate = memo(function EntryDate(props: { date?: string }) {
  const { date } = props;
  const day = getDayWithFallback(date);
  const month = getMonthNameWithFallback(date);
  const year = getYearWithFallback(date);
  const weekday = getWeekdayWithFallback(date);
  return (
    <div>
      <p className="text-6xl font-light leading-none text-ink opacity-80">{day}</p>
      <p className="text-sm mt-2 tracking-wide text-ink-secondary">{weekday}</p>
      <p className="text-sm mt-0.5 text-ink-secondary opacity-60">
        {month}, {year}
      </p>
    </div>
  );
});
