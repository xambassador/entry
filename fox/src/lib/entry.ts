import type { Entry, GetEntriesResponse } from "@/types";

import { MONTH_NAMES } from "@/lib/constant";

type Entries = GetEntriesResponse["entries"];
type Week = {
  label: string;
  entries: Entry[];
};

export function groupEntriesByWeek(entries: Entries, month: number, year: number) {
  // If we pass month as 0-indexed, then 0 in day will give us the last day of the previous month.
  const totalDays = new Date(year, month + 1, 0).getDate();
  const weeks: Week[] = [];

  const monthString = String(month + 1).padStart(2, "0");
  const toDateString = (day: number) => `${year}-${monthString}-${String(day).padStart(2, "0")}`;

  for (let day = 1; day <= totalDays; day += 7) {
    const start = new Date(year, month, day);
    const endDay = day + 6 > totalDays ? totalDays : day + 6;
    const end = new Date(year, month, endDay);
    const label = `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} - ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}`;
    const week: Week = { label, entries: [] };

    const days: string[] = [];
    for (let currentDay = day; currentDay <= endDay; currentDay++) {
      days.push(toDateString(currentDay));
    }

    for (const day of days) {
      for (const entry of entries) {
        if (entry.date === day) {
          week.entries.push(entry);
        }
      }
    }

    weeks.push(week);
  }

  return { weeks };
}
