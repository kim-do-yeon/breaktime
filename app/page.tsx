// Main page: wires the planner form → ranking algorithm → results + my calendar.
"use client";

import { useMemo, useState } from "react";
import type { Plan, Suggestion, User } from "@/lib/types";
import { getHolidaysForYear, coverageRange } from "@/lib/holidays/korea";
import { generateCandidates } from "@/lib/candidates";
import { rankWindows } from "@/lib/rank";
import { totalDays } from "@/lib/format";
import { usePlannerStorage } from "@/hooks/usePlannerStorage";
import { usePlans } from "@/hooks/usePlans";
import { PlannerForm } from "@/components/PlannerForm";
import { SuggestionList, suggestionKey } from "@/components/SuggestionList";
import { EmptyState } from "@/components/EmptyState";
import { SeasonGuide } from "@/components/SeasonGuide";
import { MyCalendar } from "@/components/MyCalendar";

type ResultState =
  | { kind: "idle" }
  | { kind: "ok"; suggestions: Suggestion[] }
  | { kind: "empty-no-pto" }
  | { kind: "empty-all-blackout" }
  | { kind: "out-of-coverage" };

function computeResult(user: User): ResultState {
  if (user.year < coverageRange.minYear || user.year > coverageRange.maxYear) {
    return { kind: "out-of-coverage" };
  }
  if (user.daysRemaining <= 0) {
    return { kind: "empty-no-pto" };
  }
  const holidays = getHolidaysForYear(user.year);
  const candidates = generateCandidates(user, holidays);
  if (candidates.length === 0) {
    return { kind: "empty-all-blackout" };
  }
  const suggestions = rankWindows(candidates);
  if (suggestions.length === 0) {
    return { kind: "empty-all-blackout" };
  }
  return { kind: "ok", suggestions };
}

export default function Home() {
  const { user, setUser, hydrated } = usePlannerStorage();
  const { plans, addPlan, removePlan } = usePlans();
  // Result is recomputed fresh on every submit — never shows stale data.
  const [result, setResult] = useState<ResultState>({ kind: "idle" });
  // Snapshot of the year the current results were computed for.
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  function handleSubmit(submitted: User) {
    setResult(computeResult(submitted));
    setActiveUser(submitted);
    setWarning(null);
  }

  const activeYear = activeUser?.year ?? user.year;
  const inCoverage =
    activeYear >= coverageRange.minYear && activeYear <= coverageRange.maxYear;
  const activeHolidays = inCoverage ? getHolidaysForYear(activeYear) : [];

  // Plans belonging to the active year (for the "my calendar" summary).
  const yearPlans = useMemo(
    () => plans.filter((p) => p.start.startsWith(String(activeYear))),
    [plans, activeYear]
  );
  const usedDays = yearPlans.reduce((sum, p) => sum + p.ptoDays, 0);
  const totalPto = activeUser?.daysRemaining ?? user.daysRemaining;

  const addedKeys = useMemo(
    () => new Set(plans.map((p) => `${p.start}|${p.end}`)),
    [plans]
  );

  function handleAdd(s: Suggestion) {
    const plan: Plan = {
      start: s.window.start,
      end: s.window.end,
      ptoDays: s.window.ptoDays,
      totalDays: totalDays(s.window),
    };
    if (usedDays + plan.ptoDays > totalPto) {
      setWarning(
        `남은 연차(${totalPto - usedDays}일)보다 많은 연차(${plan.ptoDays}일)가 필요해 추가할 수 없어요.`
      );
      return;
    }
    setWarning(null);
    addPlan(plan);
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          🏖️ 브레이크타임
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          남은 연차로 가장 알차게 쉴 수 있는 휴가 기간을 찾아드립니다.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,340px)_1fr]">
        {/* Left column: form + season guide + my calendar */}
        <div className="space-y-6">
          {hydrated ? (
            <PlannerForm
              user={user}
              onChange={setUser}
              onSubmit={handleSubmit}
            />
          ) : (
            <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
          )}

          <SeasonGuide />

          {inCoverage && (
            <MyCalendar
              plans={yearPlans}
              year={activeYear}
              totalDays={totalPto}
              holidays={activeHolidays}
              onRemove={(localIndex) => {
                // Map the year-filtered index back to the global plans index.
                const target = yearPlans[localIndex];
                const globalIndex = plans.findIndex(
                  (p) => p.start === target.start && p.end === target.end
                );
                if (globalIndex >= 0) removePlan(globalIndex);
              }}
            />
          )}
        </div>

        {/* Right column: results */}
        <section className="space-y-3">
          {warning && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              ⚠️ {warning}
            </div>
          )}

          {result.kind === "idle" && (
            <EmptyState
              icon="👈"
              title="휴가 정보를 입력하세요"
              message="남은 연차와 휴가 연도를 입력하고 '최적 휴가 찾기'를 누르면 추천 결과가 여기에 표시됩니다."
            />
          )}
          {result.kind === "ok" && (
            <SuggestionList
              suggestions={result.suggestions}
              year={activeYear}
              holidays={activeHolidays}
              addedKeys={addedKeys}
              onAdd={handleAdd}
            />
          )}
          {result.kind === "empty-no-pto" && (
            <EmptyState
              icon="🈳"
              title="남은 연차가 없습니다"
              message="추천할 휴가 기간이 없습니다. 남은 연차 일수를 1일 이상으로 입력해 주세요."
            />
          )}
          {result.kind === "empty-all-blackout" && (
            <EmptyState
              icon="🚫"
              title="가능한 휴가 기간이 없습니다"
              message="모든 후보 기간이 블랙아웃과 겹치거나 조건을 만족하지 않습니다. 블랙아웃 기간을 줄이거나 연차 일수를 조정해 보세요."
            />
          )}
          {result.kind === "out-of-coverage" && (
            <EmptyState
              icon="📅"
              title="아직 지원하지 않는 연도입니다"
              message={`현재 ${coverageRange.minYear}~${coverageRange.maxYear}년 공휴일만 지원합니다. 해당 기간의 공휴일 데이터가 확정되면 지원 연도가 확장됩니다.`}
            />
          )}
        </section>
      </div>

      <footer className="mt-12 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
        브레이크타임 · 공휴일 데이터 {coverageRange.minYear}~
        {coverageRange.maxYear}년 · 입력값은 브라우저에만 저장됩니다.
      </footer>
    </main>
  );
}
