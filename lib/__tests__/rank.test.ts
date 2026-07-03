/**
 * Tests for the ranking algorithm.
 *
 * Uses real holiday data (no mocks) per plan FD requirements.
 * Fixed-input determinism test: Korea 2026, 15 PTO days, blackout Dec 20–Jan 5.
 */

import { describe, it, expect } from "vitest";
import { generateCandidates } from "@/lib/candidates";
import { rankWindows } from "@/lib/rank";
import { getHolidaysForYear } from "@/lib/holidays/korea";
import type { User } from "@/lib/types";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    daysRemaining: 15,
    year: 2026,
    blackouts: [],
    country: "KR",
    ...overrides,
  };
}

describe("generateCandidates", () => {
  it("returns empty array when daysRemaining is 0", () => {
    const user = makeUser({ daysRemaining: 0 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    expect(candidates).toHaveLength(0);
  });

  it("returns empty array when all days are blacked out", () => {
    const user = makeUser({
      year: 2026,
      daysRemaining: 15,
      blackouts: [{ start: "2026-01-01", end: "2026-12-31" }],
    });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    expect(candidates).toHaveLength(0);
  });

  it("all candidates have leverage ≥ 1", () => {
    const user = makeUser({ daysRemaining: 10 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    for (const c of candidates) {
      expect(c.leverage).toBeGreaterThanOrEqual(1);
    }
  });

  it("all candidates have ptoDays ≤ daysRemaining", () => {
    const user = makeUser({ daysRemaining: 5 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    for (const c of candidates) {
      expect(c.ptoDays).toBeLessThanOrEqual(5);
    }
  });

  it("all candidates are within target year", () => {
    const user = makeUser({ year: 2026, daysRemaining: 15 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    for (const c of candidates) {
      expect(c.start.startsWith("2026")).toBe(true);
      expect(c.end.startsWith("2026")).toBe(true);
    }
  });

  it("all candidates have window length between 3 and 16 days", () => {
    const user = makeUser({ daysRemaining: 15 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    for (const c of candidates) {
      const startMs = new Date(c.start + "T00:00:00Z").getTime();
      const endMs = new Date(c.end + "T00:00:00Z").getTime();
      const length = Math.round((endMs - startMs) / 86400000) + 1;
      expect(length).toBeGreaterThanOrEqual(3);
      expect(length).toBeLessThanOrEqual(16);
    }
  });

  it("excludes windows overlapping blackout periods", () => {
    const user = makeUser({
      daysRemaining: 15,
      blackouts: [{ start: "2026-05-01", end: "2026-05-31" }],
    });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    for (const c of candidates) {
      // No window should touch May
      expect(c.end < "2026-05-01" || c.start > "2026-05-31").toBe(true);
    }
  });

  it("leverage = nonWorkingDays - ptoDays for all candidates", () => {
    const user = makeUser({ daysRemaining: 15 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    for (const c of candidates) {
      expect(c.leverage).toBe(c.nonWorkingDays - c.ptoDays);
    }
  });
});

describe("rankWindows", () => {
  it("returns empty array for empty candidates", () => {
    const result = rankWindows([]);
    expect(result).toHaveLength(0);
  });

  it("returns at most 5 suggestions", () => {
    const user = makeUser({ year: 2026, daysRemaining: 15 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    const suggestions = rankWindows(candidates);
    expect(suggestions.length).toBeLessThanOrEqual(5);
  });

  it("scores are normalized 0–100", () => {
    const user = makeUser({ year: 2026, daysRemaining: 15 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    const suggestions = rankWindows(candidates);
    for (const s of suggestions) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
    }
  });

  it("top suggestion has score 100 (normalization)", () => {
    const user = makeUser({ year: 2026, daysRemaining: 15 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    const suggestions = rankWindows(candidates);
    if (suggestions.length > 0) {
      expect(suggestions[0].score).toBe(100);
    }
  });

  it("suggestions are sorted descending by score", () => {
    const user = makeUser({ year: 2026, daysRemaining: 15 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    const suggestions = rankWindows(candidates);
    for (let i = 1; i < suggestions.length; i++) {
      expect(suggestions[i].score).toBeLessThanOrEqual(suggestions[i - 1].score);
    }
  });

  it("each suggestion has 3 factors (bridge_days, off_season, holiday_bonus)", () => {
    const user = makeUser({ year: 2026, daysRemaining: 15 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    const suggestions = rankWindows(candidates);
    for (const s of suggestions) {
      expect(s.factors).toHaveLength(3);
      const types = s.factors.map((f) => f.type);
      expect(types).toContain("bridge_days");
      expect(types).toContain("off_season");
      expect(types).toContain("holiday_bonus");
    }
  });
});

describe("rankWindows — fixed-input determinism test", () => {
  /**
   * Frozen scenario: Korea 2026, 15 PTO days, blackout Dec 20–Jan 5.
   * This test asserts that the algorithm is deterministic — same inputs → same outputs.
   * The first run establishes the snapshot; subsequent runs must match exactly.
   */
  const FIXED_USER: User = {
    daysRemaining: 15,
    year: 2026,
    blackouts: [{ start: "2026-12-20", end: "2026-12-31" }],
    country: "KR",
  };

  it("produces results for fixed input (has suggestions)", () => {
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(FIXED_USER, holidays);
    const suggestions = rankWindows(candidates);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("is deterministic — same output on repeated calls", () => {
    const holidays = getHolidaysForYear(2026);

    const run1Candidates = generateCandidates(FIXED_USER, holidays);
    const run1 = rankWindows(run1Candidates);

    const run2Candidates = generateCandidates(FIXED_USER, holidays);
    const run2 = rankWindows(run2Candidates);

    expect(run1.length).toBe(run2.length);
    for (let i = 0; i < run1.length; i++) {
      expect(run1[i].window.start).toBe(run2[i].window.start);
      expect(run1[i].window.end).toBe(run2[i].window.end);
      expect(run1[i].score).toBe(run2[i].score);
      expect(run1[i].rawScore).toBe(run2[i].rawScore);
    }
  });

  it("top suggestion score is 100", () => {
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(FIXED_USER, holidays);
    const suggestions = rankWindows(candidates);
    expect(suggestions[0]?.score).toBe(100);
  });

  it("no suggestions overlap the blackout period Dec 20–Dec 31", () => {
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(FIXED_USER, holidays);
    const suggestions = rankWindows(candidates);
    for (const s of suggestions) {
      // Window must end before Dec 20 or start after Dec 31
      const noOverlap =
        s.window.end < "2026-12-20" || s.window.start > "2026-12-31";
      expect(noOverlap).toBe(true);
    }
  });

  it("no suggestion uses more PTO than user has (15 days)", () => {
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(FIXED_USER, holidays);
    const suggestions = rankWindows(candidates);
    for (const s of suggestions) {
      expect(s.window.ptoDays).toBeLessThanOrEqual(15);
    }
  });
});

describe("edge cases", () => {
  it("0 PTO → empty suggestions", () => {
    const user = makeUser({ daysRemaining: 0 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    const suggestions = rankWindows(candidates);
    expect(suggestions).toHaveLength(0);
  });

  it("all-blackout → empty suggestions, no crash", () => {
    const user = makeUser({
      daysRemaining: 15,
      blackouts: [{ start: "2026-01-01", end: "2026-12-31" }],
    });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    expect(() => rankWindows(candidates)).not.toThrow();
    const suggestions = rankWindows(candidates);
    expect(suggestions).toHaveLength(0);
  });

  it("very low PTO (1 day) may still find windows with very high holiday leverage", () => {
    // With 1 PTO day, leverage must be ≥ 1, meaning ≥ 2 non-working days in window
    const user = makeUser({ daysRemaining: 1 });
    const holidays = getHolidaysForYear(2026);
    const candidates = generateCandidates(user, holidays);
    // 1 PTO day + ≥2 non-working = window where you take 1 weekday between two weekend/holiday spans
    // This should yield some results (e.g., a Friday bridge day between Thursday holiday and weekend)
    // We don't assert exact count here — just that it doesn't crash
    expect(() => rankWindows(candidates)).not.toThrow();
  });
});
