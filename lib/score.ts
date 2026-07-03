/**
 * Scoring function for a single vacation window.
 *
 * Computes raw score and factor breakdown using:
 *   raw = 0.6 * leverage_norm + 0.3 * season_weight + 0.1 * holiday_bonus
 *
 * leverage_norm: leverage / maxLeverage (caller provides maxLeverage across all candidates)
 * season_weight: from seasonality table, using dominant month of window
 * holiday_bonus: min(holidays_in_window / 3, 1)
 */

import type { VacationWindow, Factor } from "@/lib/types";
import { getSeasonWeight } from "@/data/seasonality-kr";
import { computeRawScore } from "@/lib/scoring/weights";
import { getMonth } from "@/lib/candidates";

export interface ScoredWindow {
  window: VacationWindow;
  rawScore: number;
  factors: Factor[];
}

/**
 * Get the dominant month of a window (month containing most days,
 * or start month on tie). Returns 1-indexed month.
 */
function getDominantMonth(start: string, end: string): number {
  const startMonth = getMonth(start);
  const endMonth = getMonth(end);

  if (startMonth === endMonth) return startMonth;

  // Count days per month
  const monthCounts: Record<number, number> = {};
  let current = start;
  while (current <= end) {
    const m = getMonth(current);
    monthCounts[m] = (monthCounts[m] ?? 0) + 1;
    // Advance one day
    const d = new Date(current + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + 1);
    current = d.toISOString().slice(0, 10);
  }

  let dominant = startMonth;
  let maxCount = 0;
  for (const [monthStr, count] of Object.entries(monthCounts)) {
    const month = parseInt(monthStr, 10);
    if (count > maxCount || (count === maxCount && month < dominant)) {
      maxCount = count;
      dominant = month;
    }
  }
  return dominant;
}

/**
 * Score a single vacation window.
 *
 * @param window      - the candidate window to score
 * @param maxLeverage - the maximum leverage across all candidates (for normalization)
 */
export function scoreWindow(
  window: VacationWindow,
  maxLeverage: number
): ScoredWindow {
  // Leverage normalization: leverage / max leverage, capped at 1
  const leverageNorm =
    maxLeverage > 0 ? Math.min(window.leverage / maxLeverage, 1) : 0;

  // Season weight from dominant month
  const dominantMonth = getDominantMonth(window.start, window.end);
  const seasonWeight = getSeasonWeight(dominantMonth);

  // Holiday bonus: 1 holiday = 0.33, 2 = 0.67, 3+ = 1.0
  const holidayBonus = Math.min(window.holidays.length / 3, 1);

  const rawScore = computeRawScore(leverageNorm, seasonWeight, holidayBonus);

  const factors: Factor[] = [
    {
      type: "bridge_days",
      value: leverageNorm,
      label: `브릿지 효율 ${Math.round(leverageNorm * 100)}%`,
    },
    {
      type: "off_season",
      value: seasonWeight,
      label: `비수기 지수 ${Math.round(seasonWeight * 100)}%`,
    },
    {
      type: "holiday_bonus",
      value: holidayBonus,
      label: `공휴일 보너스 ${window.holidays.length}일`,
    },
  ];

  return { window, rawScore, factors };
}
