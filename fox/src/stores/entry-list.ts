import { useStore } from "@nanostores/react";
import { atom } from "nanostores";

import { CURRENT_MONTH, CURRENT_YEAR } from "@/lib/constant";

const selectedYearAtom = atom(CURRENT_YEAR);
const selectedMonthAtom = atom(CURRENT_MONTH);

export function updateSelectedYear(year: number) {
  selectedYearAtom.set(year);
}

export function updateSelectedMonth(month: number) {
  selectedMonthAtom.set(month);
}

export function useSelectedYear() {
  return useStore(selectedYearAtom);
}

export function useSelectedMonth() {
  return useStore(selectedMonthAtom);
}
