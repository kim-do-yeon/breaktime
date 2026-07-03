/**
 * Off-season weight table for Korea by month (1-indexed).
 *
 * Values range 0..1 where:
 *   1.0 = best off-season (cheap, uncrowded, good for budget travel)
 *   0.0 = peak season (expensive, crowded — low off-season weight)
 *
 * Rationale:
 * - Jul/Aug: peak summer vacation season, highest prices → 0.1
 * - Feb: Seollal travel rush, cold, limited appeal → 0.2
 * - Jan: New Year + cold → 0.25
 * - Sep: Chuseok rush → 0.3
 * - Dec: Christmas/New Year rush → 0.3
 * - May: Children's Day / Buddha's Birthday cluster, busy → 0.55
 * - Oct: fall foliage season, Hangeul/Foundation Day cluster, busy → 0.5
 * - Mar: early spring, quiet, cheap → 0.8
 * - Jun: pre-summer, still mild, cheaper → 0.85
 * - Nov: late autumn, very quiet, excellent value → 0.85
 * - Apr: cherry blossom peak (busy) but short window, shoulder → 0.7
 */
export const seasonalityByMonth: Record<number, number> = {
  1: 0.25, // January — cold, post-New Year rush
  2: 0.2, // February — Seollal rush, cold
  3: 0.8, // March — spring shoulder, quiet
  4: 0.7, // April — cherry blossoms (popular but short)
  5: 0.55, // May — Children's Day / Buddha's Birthday cluster
  6: 0.85, // June — pre-summer, mild, cheap
  7: 0.1, // July — peak summer, very expensive
  8: 0.1, // August — peak summer, very expensive
  9: 0.3, // September — Chuseok rush
  10: 0.5, // October — fall busy season
  11: 0.85, // November — excellent shoulder month
  12: 0.3, // December — Christmas/New Year rush
};

/**
 * Get the off-season weight for a given month (1-indexed).
 * Returns 0.5 as neutral fallback for unknown months.
 */
export function getSeasonWeight(month: number): number {
  return seasonalityByMonth[month] ?? 0.5;
}
