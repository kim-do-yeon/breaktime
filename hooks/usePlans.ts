// localStorage persistence for the user's added vacation plans.
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Plan } from "@/lib/types";

const STORAGE_KEY = "breaktime.plans.v1";

function isPlan(v: unknown): v is Plan {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.start === "string" &&
    typeof p.end === "string" &&
    typeof p.ptoDays === "number" &&
    typeof p.totalDays === "number"
  );
}

function loadPlans(): Plan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPlan) : [];
  } catch {
    return [];
  }
}

/** Manage the user's saved vacation plans with localStorage persistence. */
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPlans(loadPlans());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // best-effort persistence
    }
  }, [plans, hydrated]);

  /** Add a plan unless an identical (start,end) plan already exists. */
  const addPlan = useCallback((plan: Plan) => {
    setPlans((prev) =>
      prev.some((p) => p.start === plan.start && p.end === plan.end)
        ? prev
        : [...prev, plan].sort((a, b) => a.start.localeCompare(b.start))
    );
  }, []);

  const removePlan = useCallback((index: number) => {
    setPlans((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return { plans, addPlan, removePlan, hydrated };
}
