/**
 * Scoring weights and raw score computation.
 *
 * Frozen Decision FD-7:
 *   raw = 0.6 * leverage_norm + 0.3 * season_weight + 0.1 * holiday_bonus
 *
 * All weights live here so tuning never touches algorithm logic.
 */

export const WEIGHTS = {
  leverage: 0.6,
  season: 0.3,
  holiday_bonus: 0.1,
} as const;

/**
 * Compute raw score (0..1) for a vacation window.
 *
 * @param leverageNorm   - leverage normalized 0..1 (leverage / max observed leverage)
 * @param seasonWeight   - off-season weight for dominant month 0..1
 * @param holidayBonus   - holiday density bonus 0..1 (capped at 1)
 */
export function computeRawScore(
  leverageNorm: number,
  seasonWeight: number,
  holidayBonus: number
): number {
  return (
    WEIGHTS.leverage * leverageNorm +
    WEIGHTS.season * seasonWeight +
    WEIGHTS.holiday_bonus * holidayBonus
  );
}
