export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
export const CURRENT_YEAR = new Date().getFullYear();
export const CURRENT_MONTH = new Date().getMonth();
export const EARLIEST_YEAR = 2000;
export const YEARS = Array.from({ length: CURRENT_YEAR - EARLIEST_YEAR + 1 }, (_, i) => EARLIEST_YEAR + i);
export const MINI_WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
