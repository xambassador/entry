import { useCallback, useEffect, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";

import { MonthStrip } from "@/components/month-stripe";
import { YearStrip } from "@/components/year-stripe";

import { CURRENT_MONTH, CURRENT_YEAR } from "@/lib/constant";

export function YearSelector() {
  const routeApi = getRouteApi("/entries");
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [year, setYear] = useState(search.year);

  const onCommit = useCallback(
    (nextYear: number) => {
      navigate({
        search: (prev) => {
          const maxMonth = nextYear === CURRENT_YEAR ? CURRENT_MONTH : 11;
          return {
            ...prev,
            year: nextYear,
            month: Math.min(prev.month, maxMonth)
          };
        }
      });
    },
    [navigate]
  );

  const onYearChange = useCallback((y: number) => setYear(y), []);

  useEffect(() => {
    setYear(search.year);
  }, [search.year]);

  return <YearStrip year={year} onYearChange={onYearChange} onCommit={onCommit} />;
}

export function MonthSelector() {
  const routeApi = getRouteApi("/entries");
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [month, setMonth] = useState(search.month);
  const year = search.year;
  const maxMonth = year === CURRENT_YEAR ? CURRENT_MONTH : 11;

  const onMonthCommit = useCallback(
    (nextMonth: number) => {
      navigate({
        search: (prev) => ({
          year: prev.year,
          month: nextMonth
        })
      });
    },
    [navigate]
  );

  const onMonthChange = useCallback((m: number) => setMonth(m), []);

  useEffect(() => {
    setMonth(search.month);
  }, [search.month]);

  return <MonthStrip month={month} maxMonth={maxMonth} onMonthCommit={onMonthCommit} onMonthChange={onMonthChange} />;
}
