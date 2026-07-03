// localStorage persistence for planner inputs (MVP — no backend).
"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { coverageRange } from "@/lib/holidays/korea";

const STORAGE_KEY = "breaktime.planner.v1";

/** Default form state. */
export function defaultUser(): User {
  return {
    daysRemaining: 15,
    year: coverageRange.minYear,
    blackouts: [],
    country: "KR",
  };
}

/** Safely read persisted inputs from localStorage. */
function loadFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<User>;
    // Shape guard; drop malformed blackout entries so corrupt storage can't
    // inject undefined dates into the ranking algorithm.
    const blackouts = Array.isArray(parsed.blackouts)
      ? parsed.blackouts.filter(
          (b): b is { start: string; end: string } =>
            !!b &&
            typeof b === "object" &&
            typeof (b as { start?: unknown }).start === "string" &&
            typeof (b as { end?: unknown }).end === "string"
        )
      : [];
    return {
      daysRemaining:
        typeof parsed.daysRemaining === "number" ? parsed.daysRemaining : 15,
      year: typeof parsed.year === "number" ? parsed.year : coverageRange.minYear,
      blackouts,
      country: "KR",
    };
  } catch {
    return null;
  }
}

/**
 * Hook that keeps planner inputs in state and mirrors them to localStorage.
 * `hydrated` is false during the first client render to avoid SSR mismatch.
 */
export function usePlannerStorage() {
  const [user, setUser] = useState<User>(defaultUser);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) setUser(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore quota / private-mode write errors — persistence is best-effort.
    }
  }, [user, hydrated]);

  const reset = useCallback(() => setUser(defaultUser()), []);

  return { user, setUser, hydrated, reset };
}
