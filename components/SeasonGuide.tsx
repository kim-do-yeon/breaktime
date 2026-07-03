// Collapsible peak / off-season guide with pricing + timing detail.
"use client";

import { useState } from "react";
import { seasonGuideList, type SeasonTier } from "@/data/seasonality-kr";

const TIER_STYLE: Record<SeasonTier, { chip: string; bar: string }> = {
  peak: { chip: "bg-red-100 text-red-700", bar: "bg-red-400" },
  shoulder: { chip: "bg-amber-100 text-amber-700", bar: "bg-amber-400" },
  off: { chip: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500" },
};

/** Render a 5-dot price meter. */
function PriceMeter({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`가격 수준 ${level}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            i <= level ? "bg-gray-700" : "bg-gray-200"
          }`}
        />
      ))}
    </span>
  );
}

export function SeasonGuide() {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          🌦️ 성수기 · 비수기 가이드
        </span>
        <span className="flex items-center gap-2 text-xs text-gray-400">
          {open ? "접기" : "월별 가격·시기 보기"}
          <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
            ⌄
          </span>
        </span>
      </button>

      {!open && (
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          비수기(3·6·11월)는 항공·숙박이 저렴하고 한산하며, 극성수기(7·8월)와
          명절(2·9월)은 가격이 가장 비쌉니다. 추천 점수의 30%가 이 지수를 반영합니다.
        </p>
      )}

      {open && (
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">
              성수기 = 비쌈·혼잡
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
              준성수기 = 보통
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
              비수기 = 저렴·한산
            </span>
          </div>

          <ul className="divide-y divide-gray-100">
            {seasonGuideList.map((s) => {
              const style = TIER_STYLE[s.tier];
              return (
                <li key={s.month} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-9 text-sm font-semibold text-gray-800">
                        {s.month}월
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${style.chip}`}
                      >
                        {s.tierLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">가격</span>
                      <PriceMeter level={s.priceLevel} />
                    </div>
                  </div>
                  <div className="mt-1.5 pl-11">
                    <p className="text-xs text-gray-600">💰 {s.priceNote}</p>
                    <p className="mt-0.5 text-xs text-gray-500">📅 {s.timingNote}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
