// A single ranked vacation suggestion card.
"use client";

import { useState } from "react";
import type { Holiday, Suggestion } from "@/lib/types";
import {
  formatRange,
  totalDays,
  suggestionToText,
  suggestionToIcs,
} from "@/lib/format";
import { monthsInRange } from "@/lib/calendar";
import { MiniCalendar, CalendarLegend } from "@/components/MiniCalendar";
import { ScoreExplain } from "@/components/ScoreExplain";

interface SuggestionCardProps {
  suggestion: Suggestion;
  rank: number;
  year: number;
  holidays: Holiday[];
  isAdded: boolean;
  onAdd: (suggestion: Suggestion) => void;
}

const FACTOR_STYLES: Record<string, string> = {
  holiday_bonus: "bg-rose-100 text-rose-700",
  off_season: "bg-sky-100 text-sky-700",
  bridge_days: "bg-amber-100 text-amber-700",
};

export function SuggestionCard({
  suggestion,
  rank,
  year,
  holidays,
  isAdded,
  onAdd,
}: SuggestionCardProps) {
  const { window: w, score, factors } = suggestion;
  const [copied, setCopied] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const months = monthsInRange(w.start, w.end);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(suggestionToText(suggestion));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable (insecure context) — no-op.
    }
  }

  function handleIcsDownload() {
    const blob = new Blob([suggestionToIcs(suggestion)], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `휴가_${w.start}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
            {rank}
          </span>
          <div>
            <p className="text-base font-semibold text-gray-900">
              {formatRange(w)}
            </p>
            <p className="mt-0.5 text-sm text-gray-500">
              총 <span className="font-medium text-gray-700">{totalDays(w)}일</span>{" "}
              휴식 · 연차{" "}
              <span className="font-medium text-indigo-600">{w.ptoDays}일</span>{" "}
              사용
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{score}</div>
          <div className="text-[11px] uppercase tracking-wide text-gray-400">
            score
          </div>
        </div>
      </div>

      {/* Factors */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {factors.map((f) => (
          <span
            key={f.type}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              FACTOR_STYLES[f.type] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {f.label}
          </span>
        ))}
      </div>

      {/* Holidays included */}
      {w.holidays.length > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          🎌 포함 공휴일: {w.holidays.map((h) => h.nameKo).join(", ")}
        </p>
      )}

      {/* Calendar preview toggle */}
      <button
        type="button"
        onClick={() => setShowCalendar((v) => !v)}
        aria-expanded={showCalendar}
        className="mt-3 flex w-full items-center justify-between border-t border-gray-100 pt-3 text-xs font-medium text-gray-500 transition hover:text-gray-700"
      >
        <span>📅 달력에서 보기</span>
        <span className={`transition-transform ${showCalendar ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
      {showCalendar && (
        <div className="mt-3 space-y-2">
          <CalendarLegend />
          <div
            className={`grid gap-3 ${
              months.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {months.map((m) => (
              <div key={m} className="rounded-xl bg-gray-50 p-3">
                <MiniCalendar
                  year={year}
                  month={m}
                  holidays={holidays}
                  vacationRanges={[{ start: w.start, end: w.end }]}
                  compact
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score explanation */}
      <ScoreExplain suggestion={suggestion} />

      {/* Primary action: add to my calendar */}
      <button
        type="button"
        onClick={() => onAdd(suggestion)}
        disabled={isAdded}
        className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
          isAdded
            ? "cursor-default bg-emerald-50 text-emerald-600"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {isAdded ? "내 캘린더에 추가됨 ✓" : "＋ 내 캘린더에 추가"}
      </button>

      {/* Secondary actions */}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {copied ? "복사됨 ✓" : "복사"}
        </button>
        <button
          type="button"
          onClick={handleIcsDownload}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          캘린더 저장 (.ics)
        </button>
      </div>
    </article>
  );
}
