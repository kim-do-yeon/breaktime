/**
 * Candidate vacation window generation.
 *
 * Frozen Decision FD-7:
 * - Windows are 3–16 calendar days
 * - Non-working day = Saturday OR Sunday OR public holiday OR substitute holiday
 * - PTO days spent = working days in window (calendar days that are NOT non-working)
 * - Leverage = nonWorkingDays − ptoDays; valid iff leverage ≥ 1
 * - Exclude windows overlapping any blackout range
 * - Exclude cross-year windows (Dec→Jan)
 * - PTO days spent must be ≤ user.daysRemaining
 */

import type { User, VacationWindow, Holiday, Blackout } from "@/lib/types";

const MIN_WINDOW_DAYS = 3;
const MAX_WINDOW_DAYS = 16;

/** Add `days` calendar days to a YYYY-MM-DD date string */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Get day-of-week (0=Sun, 6=Sat) for a YYYY-MM-DD string (UTC) */
function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + "T00:00:00Z").getUTCDay();
}

/** Get month (1-indexed) from a YYYY-MM-DD string */
export function getMonth(dateStr: string): number {
  return parseInt(dateStr.slice(5, 7), 10);
}

/** Get year from a YYYY-MM-DD string */
export function getYear(dateStr: string): number {
  return parseInt(dateStr.slice(0, 4), 10);
}

/** Return all calendar days between start and end (inclusive) as YYYY-MM-DD strings */
function getDaysInWindow(start: string, end: string): string[] {
  const days: string[] = [];
  let current = start;
  while (current <= end) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
}

/** Build a Set of all non-working date strings for fast lookup */
function buildNonWorkingSet(holidays: Holiday[]): Set<string> {
  // We add weekends dynamically per-window, but holidays go here
  return new Set(holidays.map((h) => h.date));
}

/** Check if a date string is a weekend (Saturday or Sunday) */
function isWeekend(dateStr: string): boolean {
  const dow = getDayOfWeek(dateStr);
  return dow === 0 || dow === 6;
}

/** Check if a date string is non-working (weekend or holiday) */
function isNonWorking(dateStr: string, holidaySet: Set<string>): boolean {
  return isWeekend(dateStr) || holidaySet.has(dateStr);
}

/**
 * Check if a window [start, end] overlaps any blackout range.
 * Overlap = the two intervals share at least one calendar day.
 */
function overlapsBlackout(
  windowStart: string,
  windowEnd: string,
  blackouts: Blackout[]
): boolean {
  for (const b of blackouts) {
    // Overlap iff not (windowEnd < b.start || windowStart > b.end)
    if (!(windowEnd < b.start || windowStart > b.end)) {
      return true;
    }
  }
  return false;
}

/** Count total calendar days in a window (inclusive) */
function windowLengthDays(start: string, end: string): number {
  const startMs = new Date(start + "T00:00:00Z").getTime();
  const endMs = new Date(end + "T00:00:00Z").getTime();
  return Math.round((endMs - startMs) / 86400000) + 1;
}

/**
 * Generate all candidate vacation windows for a user.
 *
 * Strategy:
 * 1. Build a set of anchor dates: any holiday or weekend day in the target year.
 * 2. For each candidate window start (every day of the year), try lengths 3..16.
 * 3. Filter by: leverage ≥ 1, ptoDays ≤ daysRemaining, no blackout overlap,
 *    no cross-year, window fully within the target year.
 *
 * Returns all valid candidates (before dedup/ranking).
 */
export function generateCandidates(
  user: User,
  holidays: Holiday[]
): VacationWindow[] {
  if (user.daysRemaining <= 0) return [];

  const { year, daysRemaining, blackouts } = user;

  // Filter holidays to the target year
  const yearHolidays = holidays.filter((h) => getYear(h.date) === year);
  const holidaySet = buildNonWorkingSet(yearHolidays);

  // Year bounds
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const candidates: VacationWindow[] = [];
  const seen = new Set<string>();

  // Iterate every possible window start day within the year
  let windowStart = yearStart;
  while (windowStart <= yearEnd) {
    // Try window lengths from MIN to MAX
    for (let length = MIN_WINDOW_DAYS; length <= MAX_WINDOW_DAYS; length++) {
      const windowEnd = addDays(windowStart, length - 1);

      // Exclude cross-year windows
      if (windowEnd > yearEnd) break;

      // Skip if overlaps any blackout
      if (overlapsBlackout(windowStart, windowEnd, blackouts)) continue;

      // Count working and non-working days
      const days = getDaysInWindow(windowStart, windowEnd);
      let nonWorkingDays = 0;
      const windowHolidays: Holiday[] = [];
      const seenHolidayDates = new Set<string>();

      for (const day of days) {
        if (isNonWorking(day, holidaySet)) {
          nonWorkingDays++;
          // Collect holidays in this window (avoid duplicates)
          const h = yearHolidays.find((h) => h.date === day);
          if (h && !seenHolidayDates.has(h.date)) {
            windowHolidays.push(h);
            seenHolidayDates.add(h.date);
          }
        }
      }

      const ptoDays = length - nonWorkingDays;
      const leverage = nonWorkingDays - ptoDays;

      // Valid iff leverage ≥ 1 and ptoDays within user's budget
      if (leverage < 1) continue;
      if (ptoDays > daysRemaining) continue;
      if (ptoDays <= 0) continue; // All non-working — no PTO needed, not a vacation window

      const key = `${windowStart}|${windowEnd}`;
      if (seen.has(key)) continue;
      seen.add(key);

      candidates.push({
        start: windowStart,
        end: windowEnd,
        ptoDays,
        nonWorkingDays,
        leverage,
        holidays: windowHolidays,
      });
    }

    windowStart = addDays(windowStart, 1);
  }

  return candidates;
}
