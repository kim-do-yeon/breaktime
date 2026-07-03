// Month-grid helpers for calendar rendering (pure, timezone-safe via UTC).
import type { Holiday } from "@/lib/types";

export interface CalendarDay {
  /** ISO date YYYY-MM-DD */
  date: string;
  /** day-of-month 1..31 */
  day: number;
  /** false for leading/trailing padding days from adjacent months */
  inMonth: boolean;
  /** Saturday or Sunday */
  isWeekend: boolean;
  /** falls on a public holiday */
  isHoliday: boolean;
  /** Korean holiday name, if any */
  holidayName?: string;
}

/** Korean weekday headers, Sunday-first. */
export const WEEKDAY_HEADERS_KO = ["일", "월", "화", "수", "목", "금", "토"];

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * Build a 6×7 (or fewer) matrix of weeks for a given month.
 * `month` is 1-indexed. Padding days from adjacent months fill the grid so
 * every week has 7 cells; padding cells have `inMonth: false`.
 */
export function getMonthMatrix(
  year: number,
  month: number,
  holidays: Holiday[]
): CalendarDay[][] {
  const holidayMap = new Map(holidays.map((h) => [h.date, h.nameKo]));
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0=Sun
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: CalendarDay[] = [];

  const makeDay = (y: number, m: number, d: number, inMonth: boolean): CalendarDay => {
    const date = iso(y, m, d);
    const dow = new Date(date + "T00:00:00Z").getUTCDay();
    return {
      date,
      day: d,
      inMonth,
      isWeekend: dow === 0 || dow === 6,
      isHoliday: holidayMap.has(date),
      holidayName: holidayMap.get(date),
    };
  };

  // Leading padding (previous month)
  if (firstDow > 0) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevDays = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate();
    for (let i = firstDow - 1; i >= 0; i--) {
      cells.push(makeDay(prevYear, prevMonth, prevDays - i, false));
    }
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(makeDay(year, month, d, true));
  }

  // Trailing padding (next month) to complete the final week
  const trailing = (7 - (cells.length % 7)) % 7;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  for (let d = 1; d <= trailing; d++) {
    cells.push(makeDay(nextYear, nextMonth, d, false));
  }

  // Chunk into weeks of 7
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/** True if `date` (YYYY-MM-DD) falls within [start, end] inclusive. */
export function isWithin(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

/** Distinct 1-indexed months spanned by a [start, end] range (same year assumed). */
export function monthsInRange(start: string, end: string): number[] {
  const startMonth = Number(start.slice(5, 7));
  const endMonth = Number(end.slice(5, 7));
  const months: number[] = [];
  for (let m = startMonth; m <= endMonth; m++) months.push(m);
  return months;
}
