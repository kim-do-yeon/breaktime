// Core domain types for the vacation planner

/** ISO date string: YYYY-MM-DD */
export type ISODateString = string;

/** A range of dates (by year boundary, not full timestamps) */
export interface DateRange {
  minYear: number;
  maxYear: number;
}

/** A Korean public holiday (primary or substitute) */
export interface Holiday {
  /** ISO date: YYYY-MM-DD */
  date: ISODateString;
  /** English name */
  name: string;
  /** Korean name */
  nameKo: string;
  /** True if this is a substitute holiday (대체공휴일) */
  isSubstitute?: boolean;
}

/** Result discriminated union from getHolidays() */
export type HolidayResult =
  | { status: "ok"; holidays: Holiday[] }
  | { status: "out-of-coverage" }
  | { status: "error"; reason: string };

/** A blackout period when the user cannot take vacation */
export interface Blackout {
  /** ISO date: YYYY-MM-DD */
  start: ISODateString;
  /** ISO date: YYYY-MM-DD */
  end: ISODateString;
}

/** User inputs for the planner */
export interface User {
  /** Number of remaining PTO days */
  daysRemaining: number;
  /** Target vacation year (2026 or 2027) */
  year: number;
  /** Date ranges when vacation is not allowed */
  blackouts: Blackout[];
  /** Country code (locked to KR for MVP) */
  country: "KR";
}

/** A factor contributing to a suggestion's score */
export interface Factor {
  type: "holiday_bonus" | "off_season" | "bridge_days";
  /** Normalized contribution value 0..1 */
  value: number;
  /** Human-readable Korean label */
  label: string;
}

/** A candidate vacation window */
export interface VacationWindow {
  /** ISO date: YYYY-MM-DD — first day of vacation */
  start: ISODateString;
  /** ISO date: YYYY-MM-DD — last day of vacation */
  end: ISODateString;
  /** Number of PTO days needed (working days in window) */
  ptoDays: number;
  /** Number of non-working days in window (weekends + holidays) */
  nonWorkingDays: number;
  /** leverage = nonWorkingDays - ptoDays (must be ≥ 1 to be valid) */
  leverage: number;
  /** Public holidays that fall within this window */
  holidays: Holiday[];
}

/** Detailed score math for the "how was this calculated" explanation */
export interface ScoreBreakdown {
  /** leverage / maxLeverage, capped at 1 */
  leverageNorm: number;
  /** off-season weight of the window's dominant month (0..1) */
  seasonWeight: number;
  /** dominant month (1-indexed) used for the season weight */
  dominantMonth: number;
  /** holiday density bonus (0..1) */
  holidayBonus: number;
  /** weighted contribution of each term to rawScore */
  weighted: { leverage: number; season: number; holiday: number };
  /** the weight constants used (for displaying the formula) */
  weights: { leverage: number; season: number; holiday: number };
}

/** A ranked vacation suggestion with score and factors */
export interface Suggestion {
  window: VacationWindow;
  /** Raw score 0..1 before normalization */
  rawScore: number;
  /** Normalized score 0..100 */
  score: number;
  /** Factor breakdown for display */
  factors: Factor[];
  /** Detailed score math for the explanation panel */
  breakdown: ScoreBreakdown;
}

/** A vacation the user has added to their personal calendar. */
export interface Plan {
  /** ISO date YYYY-MM-DD — first day */
  start: ISODateString;
  /** ISO date YYYY-MM-DD — last day */
  end: ISODateString;
  /** PTO days this plan consumes */
  ptoDays: number;
  /** Total rest days (inclusive length) */
  totalDays: number;
}
