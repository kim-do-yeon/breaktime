/**
 * Bundled Korean public holiday data for 2026–2027.
 *
 * DATA SOURCE: Curated from official Korean government announcements and
 * KASI (Korean Astronomy & Space Science Institute) lunar calendar.
 * Substitute holidays (대체공휴일) follow the Substitute Holiday Act
 * as amended (공휴일에 관한 법률, 2021-08-04 effective).
 *
 * IMPORTANT: These dates should be verified against official KASI publications
 * and government gazette (관보) before production deployment.
 *   KASI: https://www.kasi.re.kr/
 *   Government holidays: https://www.korea.go.kr/
 *
 * dataVersion: "2026-07-03" (snapshot date of this curation)
 * coverageRange: 2026–2027
 *
 * Frozen Decision FD-1: curated KASI-backed data, not a runtime rules engine.
 * Frozen Decision FD-2: rules engine is build-time only, NOT wired here.
 */

import type { Holiday, DateRange, HolidayResult } from "@/lib/types";
import type { HolidayProvider } from "@/lib/holidays/provider";

/** Snapshot date of this holiday dataset curation */
export const dataVersion = "2026-07-03";

/** Years covered by this bundled dataset */
export const coverageRange: { minYear: number; maxYear: number } = {
  minYear: 2026,
  maxYear: 2027,
};

/**
 * Korean public holidays for 2026.
 *
 * Day-of-week notes:
 * - 2026-01-01: Thursday
 * - 2026-02-17: Tuesday (Seollal/설날)
 * - 2026-02-16: Monday (day before Seollal)
 * - 2026-02-18: Wednesday (day after Seollal)
 * - 2026-03-01: Sunday → substitute 2026-03-02 Monday
 * - 2026-05-05: Tuesday (Children's Day)
 * - 2026-05-24: Sunday (Buddha's Birthday) → substitute 2026-05-25 Monday
 * - 2026-06-06: Saturday (Memorial Day) — no substitute (Memorial Day not covered by substitute act as of 2024; verify)
 * - 2026-08-15: Saturday (Liberation Day) → substitute 2026-08-17 Monday
 * - 2026-09-25: Friday (Chuseok/추석)
 * - 2026-09-24: Thursday (day before Chuseok)
 * - 2026-09-26: Saturday (day after Chuseok) → substitute 2026-09-28 Monday
 * - 2026-10-03: Saturday (National Foundation Day) → substitute 2026-10-05 Monday
 * - 2026-10-09: Friday (Hangeul Day)
 * - 2026-12-25: Friday (Christmas)
 */
const holidays2026: Holiday[] = [
  // 신정 (New Year's Day)
  { date: "2026-01-01", name: "New Year's Day", nameKo: "신정" },

  // 설날 연휴 (Lunar New Year holiday period)
  // Seollal 2026 = Lunar 1/1 = 2026-02-17 (Tuesday)
  {
    date: "2026-02-16",
    name: "Lunar New Year Eve",
    nameKo: "설날 연휴 (전날)",
  },
  { date: "2026-02-17", name: "Lunar New Year (Seollal)", nameKo: "설날" },
  {
    date: "2026-02-18",
    name: "Lunar New Year Holiday",
    nameKo: "설날 연휴 (다음날)",
  },

  // 삼일절 (Independence Movement Day) — 2026-03-01 is Sunday → substitute Monday
  {
    date: "2026-03-01",
    name: "Independence Movement Day",
    nameKo: "삼일절",
  },
  {
    date: "2026-03-02",
    name: "Independence Movement Day (substitute)",
    nameKo: "삼일절 대체공휴일",
    isSubstitute: true,
  },

  // 어린이날 (Children's Day) — 2026-05-05 is Tuesday
  { date: "2026-05-05", name: "Children's Day", nameKo: "어린이날" },

  // 부처님오신날 (Buddha's Birthday) — 2026-05-24 is Sunday → substitute Monday
  {
    date: "2026-05-24",
    name: "Buddha's Birthday",
    nameKo: "부처님오신날",
  },
  {
    date: "2026-05-25",
    name: "Buddha's Birthday (substitute)",
    nameKo: "부처님오신날 대체공휴일",
    isSubstitute: true,
  },

  // 현충일 (Memorial Day) — 2026-06-06 is Saturday
  // Note: As of 2024 law, Memorial Day is NOT covered by the substitute holiday act.
  // Verify this before production — if law changes, add substitute on 2026-06-08 (Mon).
  { date: "2026-06-06", name: "Memorial Day", nameKo: "현충일" },

  // 광복절 (Liberation Day) — 2026-08-15 is Saturday → substitute Monday 2026-08-17
  {
    date: "2026-08-15",
    name: "Liberation Day",
    nameKo: "광복절",
  },
  {
    date: "2026-08-17",
    name: "Liberation Day (substitute)",
    nameKo: "광복절 대체공휴일",
    isSubstitute: true,
  },

  // 추석 연휴 (Chuseok holiday period)
  // Chuseok 2026 = Lunar 8/15 = 2026-09-25 (Friday)
  {
    date: "2026-09-24",
    name: "Chuseok Eve",
    nameKo: "추석 연휴 (전날)",
  },
  { date: "2026-09-25", name: "Chuseok", nameKo: "추석" },
  {
    date: "2026-09-26",
    name: "Chuseok Holiday",
    nameKo: "추석 연휴 (다음날)",
  },
  // 2026-09-26 is Saturday → substitute 2026-09-28 (Monday)
  {
    date: "2026-09-28",
    name: "Chuseok Holiday (substitute)",
    nameKo: "추석 대체공휴일",
    isSubstitute: true,
  },

  // 개천절 (National Foundation Day) — 2026-10-03 is Saturday → substitute 2026-10-05 (Monday)
  {
    date: "2026-10-03",
    name: "National Foundation Day",
    nameKo: "개천절",
  },
  {
    date: "2026-10-05",
    name: "National Foundation Day (substitute)",
    nameKo: "개천절 대체공휴일",
    isSubstitute: true,
  },

  // 한글날 (Hangeul Day) — 2026-10-09 is Friday
  { date: "2026-10-09", name: "Hangeul Day", nameKo: "한글날" },

  // 크리스마스 (Christmas) — 2026-12-25 is Friday
  { date: "2026-12-25", name: "Christmas", nameKo: "크리스마스" },
];

/**
 * Korean public holidays for 2027.
 *
 * Day-of-week notes:
 * - 2027-01-01: Friday
 * - 2027-02-07: Sunday (Seollal/설날) → 2027-02-06 Sat, 2027-02-08 Mon, substitute 2027-02-09 Tue
 * - 2027-03-01: Monday (Independence Movement Day)
 * - 2027-05-05: Wednesday (Children's Day)
 * - 2027-05-13: Thursday (Buddha's Birthday)
 * - 2027-06-06: Sunday (Memorial Day) — substitute law may not apply; if it does → 2027-06-07 Mon
 * - 2027-08-15: Sunday (Liberation Day) → substitute 2027-08-16 Monday
 * - 2027-09-15: Wednesday (Chuseok/추석)
 * - 2027-09-14: Tuesday (day before Chuseok)
 * - 2027-09-16: Thursday (day after Chuseok)
 * - 2027-10-03: Sunday (National Foundation Day) → substitute 2027-10-04 Monday
 * - 2027-10-09: Saturday (Hangeul Day) → substitute 2027-10-11 Monday (10/10 is Sunday)
 * - 2027-12-25: Saturday (Christmas) → substitute 2027-12-27 Monday (12/26 is Sunday)
 */
const holidays2027: Holiday[] = [
  // 신정 (New Year's Day) — 2027-01-01 is Friday
  { date: "2027-01-01", name: "New Year's Day", nameKo: "신정" },

  // 설날 연휴 (Lunar New Year)
  // Seollal 2027 = Lunar 1/1 = 2027-02-07 (Sunday)
  // 2027-02-06 (Sat) + 2027-02-07 (Sun) fall on weekend → substitute 2027-02-09 (Tue)
  {
    date: "2027-02-06",
    name: "Lunar New Year Eve",
    nameKo: "설날 연휴 (전날)",
  },
  { date: "2027-02-07", name: "Lunar New Year (Seollal)", nameKo: "설날" },
  {
    date: "2027-02-08",
    name: "Lunar New Year Holiday",
    nameKo: "설날 연휴 (다음날)",
  },
  {
    date: "2027-02-09",
    name: "Lunar New Year (substitute)",
    nameKo: "설날 대체공휴일",
    isSubstitute: true,
  },

  // 삼일절 (Independence Movement Day) — 2027-03-01 is Monday
  {
    date: "2027-03-01",
    name: "Independence Movement Day",
    nameKo: "삼일절",
  },

  // 어린이날 (Children's Day) — 2027-05-05 is Wednesday
  { date: "2027-05-05", name: "Children's Day", nameKo: "어린이날" },

  // 부처님오신날 (Buddha's Birthday) — 2027-05-13 is Thursday
  {
    date: "2027-05-13",
    name: "Buddha's Birthday",
    nameKo: "부처님오신날",
  },

  // 현충일 (Memorial Day) — 2027-06-06 is Sunday
  // Adding substitute per precautionary inclusion; verify against final law amendment.
  {
    date: "2027-06-06",
    name: "Memorial Day",
    nameKo: "현충일",
  },
  {
    date: "2027-06-07",
    name: "Memorial Day (substitute)",
    nameKo: "현충일 대체공휴일",
    isSubstitute: true,
  },

  // 광복절 (Liberation Day) — 2027-08-15 is Sunday → substitute 2027-08-16 (Monday)
  {
    date: "2027-08-15",
    name: "Liberation Day",
    nameKo: "광복절",
  },
  {
    date: "2027-08-16",
    name: "Liberation Day (substitute)",
    nameKo: "광복절 대체공휴일",
    isSubstitute: true,
  },

  // 추석 연휴 (Chuseok holiday period)
  // Chuseok 2027 = Lunar 8/15 = 2027-09-15 (Wednesday)
  {
    date: "2027-09-14",
    name: "Chuseok Eve",
    nameKo: "추석 연휴 (전날)",
  },
  { date: "2027-09-15", name: "Chuseok", nameKo: "추석" },
  {
    date: "2027-09-16",
    name: "Chuseok Holiday",
    nameKo: "추석 연휴 (다음날)",
  },

  // 개천절 (National Foundation Day) — 2027-10-03 is Sunday → substitute 2027-10-04 (Monday)
  {
    date: "2027-10-03",
    name: "National Foundation Day",
    nameKo: "개천절",
  },
  {
    date: "2027-10-04",
    name: "National Foundation Day (substitute)",
    nameKo: "개천절 대체공휴일",
    isSubstitute: true,
  },

  // 한글날 (Hangeul Day) — 2027-10-09 is Saturday → substitute 2027-10-11 Monday
  // (2027-10-10 is Sunday, so next working day is 2027-10-11 Monday)
  {
    date: "2027-10-09",
    name: "Hangeul Day",
    nameKo: "한글날",
  },
  {
    date: "2027-10-11",
    name: "Hangeul Day (substitute)",
    nameKo: "한글날 대체공휴일",
    isSubstitute: true,
  },

  // 크리스마스 (Christmas) — 2027-12-25 is Saturday → substitute 2027-12-27 Monday
  // (2027-12-26 is Sunday, so next working day is 2027-12-27 Monday)
  {
    date: "2027-12-25",
    name: "Christmas",
    nameKo: "크리스마스",
  },
  {
    date: "2027-12-27",
    name: "Christmas (substitute)",
    nameKo: "크리스마스 대체공휴일",
    isSubstitute: true,
  },
];

/** All bundled holidays indexed by year */
const holidaysByYear: Record<number, Holiday[]> = {
  2026: holidays2026,
  2027: holidays2027,
};

/**
 * Korea holiday provider — returns bundled curated data.
 * Implements HolidayProvider interface (FD-5 async shape).
 */
export const koreaHolidayProvider: HolidayProvider = {
  async getHolidays(range: DateRange): Promise<HolidayResult> {
    // Validate the range falls within covered years
    if (
      range.minYear < coverageRange.minYear ||
      range.maxYear > coverageRange.maxYear
    ) {
      return { status: "out-of-coverage" };
    }

    try {
      const holidays: Holiday[] = [];
      for (let year = range.minYear; year <= range.maxYear; year++) {
        const yearHolidays = holidaysByYear[year];
        if (!yearHolidays) {
          return { status: "out-of-coverage" };
        }
        holidays.push(...yearHolidays);
      }
      return { status: "ok", holidays };
    } catch (err) {
      return {
        status: "error",
        reason: err instanceof Error ? err.message : "Unknown error",
      };
    }
  },
};

/**
 * Convenience: get holidays for a single year.
 * Returns empty array if year is out of coverage.
 */
export function getHolidaysForYear(year: number): Holiday[] {
  return holidaysByYear[year] ?? [];
}
