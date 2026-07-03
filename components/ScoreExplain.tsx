// Expandable "how was this score calculated" panel.
"use client";

import { useState } from "react";
import type { Suggestion } from "@/lib/types";
import { getSeasonInfo } from "@/data/seasonality-kr";

interface ScoreExplainProps {
  suggestion: Suggestion;
}

interface Term {
  label: string;
  weightPct: number;
  valuePct: number;
  contribution: number;
  detail: string;
  color: string;
}

export function ScoreExplain({ suggestion }: ScoreExplainProps) {
  const [open, setOpen] = useState(false);
  const { breakdown, window: w, rawScore } = suggestion;
  const season = getSeasonInfo(breakdown.dominantMonth);

  const terms: Term[] = [
    {
      label: "브릿지 효율",
      weightPct: Math.round(breakdown.weights.leverage * 100),
      valuePct: Math.round(breakdown.leverageNorm * 100),
      contribution: breakdown.weighted.leverage,
      detail: `연차 ${w.ptoDays}일로 비근무일 ${w.nonWorkingDays}일 확보 (순이득 ${w.leverage}일)`,
      color: "bg-amber-500",
    },
    {
      label: "비수기 지수",
      weightPct: Math.round(breakdown.weights.season * 100),
      valuePct: Math.round(breakdown.seasonWeight * 100),
      contribution: breakdown.weighted.season,
      detail: `${breakdown.dominantMonth}월 기준${season ? ` · ${season.tierLabel}` : ""}`,
      color: "bg-sky-500",
    },
    {
      label: "공휴일 보너스",
      weightPct: Math.round(breakdown.weights.holiday * 100),
      valuePct: Math.round(breakdown.holidayBonus * 100),
      contribution: breakdown.weighted.holiday,
      detail: `기간 내 공휴일 ${w.holidays.length}일 포함`,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-xs font-medium text-gray-500 transition hover:text-gray-700"
      >
        <span>📊 점수는 이렇게 계산돼요</span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-500">
            <span className="font-mono">
              원점수 = 0.6×브릿지 + 0.3×비수기 + 0.1×공휴일
            </span>
            <br />
            상위 후보의 원점수를 100점으로 환산해 상대 점수를 매깁니다.
          </p>

          <div className="space-y-2.5">
            {terms.map((t) => (
              <div key={t.label}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-gray-700">
                    {t.label}{" "}
                    <span className="text-gray-400">(가중치 {t.weightPct}%)</span>
                  </span>
                  <span className="text-gray-500">
                    {t.valuePct}% → +{t.contribution.toFixed(3)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${t.color}`}
                    style={{ width: `${t.valuePct}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">{t.detail}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
            <span className="font-medium text-gray-600">원점수 합계</span>
            <span className="font-mono font-semibold text-indigo-600">
              {rawScore.toFixed(3)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
