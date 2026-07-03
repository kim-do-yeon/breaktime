/**
 * Ranking function: takes candidates → returns top-5 suggestions.
 *
 * Frozen Decision FD-7:
 * - Score all candidates using scoreWindow()
 * - Dedup: windows overlapping ≥3 calendar days → keep higher score
 * - Sort descending by rawScore
 * - Tie-break (equal score): (a) fewer PTO days, (b) earlier start date
 * - Normalize: score = round(100 * rawScore / maxRawScore)
 * - Return top 5
 */

import type { VacationWindow, Suggestion } from "@/lib/types";
import { scoreWindow, type ScoredWindow } from "@/lib/score";

const TOP_N = 5;
const DEDUP_OVERLAP_THRESHOLD = 3; // calendar days
/** For "load more": only surface windows scoring ≥ this (0–100 relative). */
const QUALITY_FLOOR = 40;
/** Hard cap on how many distinct windows we ever surface. */
const MAX_SUGGESTIONS = 24;

/**
 * Count overlapping calendar days between two windows.
 * Returns the number of days in the intersection.
 */
function overlapDays(a: VacationWindow, b: VacationWindow): number {
  const overlapStart = a.start > b.start ? a.start : b.start;
  const overlapEnd = a.end < b.end ? a.end : b.end;
  if (overlapStart > overlapEnd) return 0;
  const startMs = new Date(overlapStart + "T00:00:00Z").getTime();
  const endMs = new Date(overlapEnd + "T00:00:00Z").getTime();
  return Math.round((endMs - startMs) / 86400000) + 1;
}

/**
 * Compare two scored windows for sorting.
 * Primary: higher rawScore wins.
 * Tie-break (a): fewer PTO days wins.
 * Tie-break (b): earlier start date wins.
 */
function compareScored(a: ScoredWindow, b: ScoredWindow): number {
  if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
  if (a.window.ptoDays !== b.window.ptoDays)
    return a.window.ptoDays - b.window.ptoDays;
  return a.window.start < b.window.start ? -1 : 1;
}

/**
 * Deduplicate scored windows: when two windows overlap by ≥3 calendar days,
 * keep only the one with the higher score (or apply tie-break).
 *
 * Greedy approach: sort by score desc, then greedily add windows that don't
 * overlap ≥3 days with any already-selected window.
 */
function dedup(scored: ScoredWindow[]): ScoredWindow[] {
  const sorted = [...scored].sort(compareScored);
  const kept: ScoredWindow[] = [];

  for (const candidate of sorted) {
    let conflicts = false;
    for (const existing of kept) {
      if (overlapDays(candidate.window, existing.window) >= DEDUP_OVERLAP_THRESHOLD) {
        conflicts = true;
        break;
      }
    }
    if (!conflicts) {
      kept.push(candidate);
    }
  }

  return kept;
}

/**
 * Score, dedup, and sort all candidates into normalized suggestions.
 * Scores are normalized 0–100 against the highest-scoring window.
 */
function rankInternal(candidates: VacationWindow[]): Suggestion[] {
  if (candidates.length === 0) return [];

  // Find max leverage for normalization
  const maxLeverage = Math.max(...candidates.map((c) => c.leverage));

  // Score all candidates
  const scored: ScoredWindow[] = candidates.map((c) =>
    scoreWindow(c, maxLeverage)
  );

  // Dedup (overlapping ≥3 days → keep higher score), then sort explicitly
  const deduplicated = dedup(scored);
  deduplicated.sort(compareScored);

  if (deduplicated.length === 0) return [];

  // Normalize scores to 0–100 against the top window
  const maxRaw = deduplicated[0].rawScore;

  return deduplicated.map((s) => ({
    window: s.window,
    rawScore: s.rawScore,
    score: maxRaw > 0 ? Math.round((100 * s.rawScore) / maxRaw) : 0,
    factors: s.factors,
    breakdown: s.breakdown,
  }));
}

/**
 * Rank vacation window candidates and return top-5 suggestions.
 *
 * @param candidates  - all valid candidate windows (from generateCandidates)
 * @returns           - up to 5 ranked Suggestion objects, scores normalized 0–100
 */
export function rankWindows(candidates: VacationWindow[]): Suggestion[] {
  return rankInternal(candidates).slice(0, TOP_N);
}

/**
 * Rank candidates for progressive "load more" display: all deduped windows
 * that clear the quality floor, capped at MAX_SUGGESTIONS. Always returns at
 * least the top window so a result is never empty when candidates exist.
 *
 * @param candidates  - all valid candidate windows
 * @returns           - ranked Suggestions worth surfacing, scores 0–100
 */
export function rankAllWindows(candidates: VacationWindow[]): Suggestion[] {
  const all = rankInternal(candidates);
  if (all.length === 0) return [];
  const worthShowing = all.filter((s) => s.score >= QUALITY_FLOOR);
  // Guarantee at least the single best window even if it's below the floor.
  const kept = worthShowing.length > 0 ? worthShowing : all.slice(0, 1);
  return kept.slice(0, MAX_SUGGESTIONS);
}
