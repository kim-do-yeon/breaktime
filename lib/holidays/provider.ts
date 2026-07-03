import type { DateRange, HolidayResult } from "@/lib/types";

/**
 * Interface for holiday data providers.
 *
 * Shape is async even though the MVP implementation (KoreaHolidayProvider)
 * resolves synchronously from bundled data. This preserves the migration path
 * to an API-route provider (Option B) without caller rewrites.
 *
 * Frozen Decision FD-5: discriminated HolidayResult shape.
 */
export interface HolidayProvider {
  /**
   * Return holidays for the given year range.
   *
   * @returns
   *   - `{ status: "ok", holidays }` when all years in range are covered
   *   - `{ status: "out-of-coverage" }` when any year is outside bundled data
   *   - `{ status: "error", reason }` on unexpected failure
   */
  getHolidays(range: DateRange): Promise<HolidayResult>;
}
