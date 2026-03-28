import { useState } from "react";
import { updateSelectedMonth, updateSelectedYear, useSelectedYear } from "@/stores/entry-list";

import { MonthStrip } from "@/components/month-stripe";
import { YearStrip } from "@/components/year-stripe";

import { CURRENT_MONTH, CURRENT_YEAR } from "@/lib/constant";

export function YearSelector() {
  const [year, setYear] = useState(CURRENT_YEAR);
  return <YearStrip year={year} onCommit={(y) => updateSelectedYear(y)} onYearChange={(y) => setYear(y)} />;
}

export function MonthSelector() {
  const [month, setMonth] = useState(CURRENT_MONTH);
  const year = useSelectedYear();
  const maxMonth = year === CURRENT_YEAR ? CURRENT_MONTH : 11;
  return (
    <MonthStrip
      month={month}
      maxMonth={maxMonth}
      onMonthCommit={(m) => updateSelectedMonth(m)}
      onMonthChange={(m) => setMonth(m)}
    />
  );
}
