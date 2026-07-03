// Planner input form: PTO days, year, blackout ranges, country (locked).
"use client";

import { useState } from "react";
import type { Blackout, User } from "@/lib/types";
import { coverageRange } from "@/lib/holidays/korea";
import { validatePlannerInput, blackoutSchema } from "@/lib/validation";

interface PlannerFormProps {
  user: User;
  onChange: (user: User) => void;
  onSubmit: (user: User) => void;
}

const YEARS = Array.from(
  { length: coverageRange.maxYear - coverageRange.minYear + 1 },
  (_, i) => coverageRange.minYear + i
);

export function PlannerForm({ user, onChange, onSubmit }: PlannerFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftBlackout, setDraftBlackout] = useState<Blackout>({
    start: "",
    end: "",
  });

  function update(patch: Partial<User>) {
    onChange({ ...user, ...patch });
  }

  function addBlackout() {
    if (!draftBlackout.start || !draftBlackout.end) return;
    const parsed = blackoutSchema.safeParse(draftBlackout);
    if (!parsed.success) {
      setErrors((e) => ({
        ...e,
        blackout: parsed.error.issues[0]?.message ?? "날짜 형식이 올바르지 않습니다.",
      }));
      return;
    }
    setErrors((e) => ({ ...e, blackout: "" }));
    update({ blackouts: [...user.blackouts, parsed.data] });
    setDraftBlackout({ start: "", end: "" });
  }

  function removeBlackout(index: number) {
    update({ blackouts: user.blackouts.filter((_, i) => i !== index) });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validatePlannerInput(user);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSubmit(user);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {/* Days remaining */}
      <div>
        <label
          htmlFor="daysRemaining"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          남은 연차 일수
        </label>
        <input
          id="daysRemaining"
          type="number"
          min={1}
          max={365}
          value={user.daysRemaining}
          onChange={(e) =>
            update({ daysRemaining: Number(e.target.value) })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.daysRemaining && (
          <p className="mt-1 text-xs text-red-600">{errors.daysRemaining}</p>
        )}
      </div>

      {/* Year */}
      <div>
        <label
          htmlFor="year"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          휴가 연도
        </label>
        <select
          id="year"
          value={user.year}
          onChange={(e) => update({ year: Number(e.target.value) })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>
        {errors.year && (
          <p className="mt-1 text-xs text-red-600">{errors.year}</p>
        )}
      </div>

      {/* Country (locked) */}
      <div>
        <label
          htmlFor="country"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          국가
        </label>
        <select
          id="country"
          value="KR"
          disabled
          className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500"
        >
          <option value="KR">대한민국 🇰🇷</option>
        </select>
        <p className="mt-1 text-xs text-gray-400">
          현재 버전은 한국 공휴일만 지원합니다.
        </p>
      </div>

      {/* Blackouts */}
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">
          휴가 불가 기간 (블랙아웃)
        </span>
        {user.blackouts.length > 0 && (
          <ul className="mb-2 space-y-1">
            {user.blackouts.map((b, i) => (
              <li
                key={`${b.start}-${b.end}-${i}`}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
              >
                <span>
                  {b.start} ~ {b.end}
                </span>
                <button
                  type="button"
                  onClick={() => removeBlackout(i)}
                  className="text-xs text-red-500 hover:underline"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            aria-label="블랙아웃 시작일"
            value={draftBlackout.start}
            onChange={(e) =>
              setDraftBlackout((d) => ({ ...d, start: e.target.value }))
            }
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <span className="text-gray-400">~</span>
          <input
            type="date"
            aria-label="블랙아웃 종료일"
            value={draftBlackout.end}
            onChange={(e) =>
              setDraftBlackout((d) => ({ ...d, end: e.target.value }))
            }
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={addBlackout}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            추가
          </button>
        </div>
        {errors.blackout && (
          <p className="mt-1 text-xs text-red-600">{errors.blackout}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        최적 휴가 찾기
      </button>
    </form>
  );
}
