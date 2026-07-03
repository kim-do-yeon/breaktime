// A compact "good to know" summary derived from all suggestions for the year.
import type { Holiday, Suggestion } from "@/lib/types";
import { totalDays, formatRange } from "@/lib/format";

interface PlannerSummaryProps {
  suggestions: Suggestion[];
  holidays: Holiday[];
}

export function PlannerSummary({ suggestions, holidays }: PlannerSummaryProps) {
  if (suggestions.length === 0) return null;

  // Best pick = highest score (suggestions are sorted desc).
  const best = suggestions[0];
  const bestRest = totalDays(best.window);

  // Longest single break available among all suggestions.
  const longest = suggestions.reduce((a, b) =>
    totalDays(b.window) > totalDays(a.window) ? b : a
  );

  // Best efficiency = highest rest-days-per-PTO-day ratio.
  const mostEfficient = suggestions.reduce((a, b) => {
    const ra = totalDays(a.window) / Math.max(a.window.ptoDays, 1);
    const rb = totalDays(b.window) / Math.max(b.window.ptoDays, 1);
    return rb > ra ? b : a;
  });
  const bestRatio = (
    totalDays(mostEfficient.window) / Math.max(mostEfficient.window.ptoDays, 1)
  ).toFixed(1);

  return (
    <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-800">✨ 이런 점을 알아두세요</h2>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-3">
          <div className="text-[11px] font-medium text-indigo-500">
            🏆 올해의 황금연휴
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-800">
            {formatRange(best.window)}
          </div>
          <div className="mt-0.5 text-xs text-gray-500">
            연차 {best.window.ptoDays}일로 {bestRest}일 휴식 (점수 {best.score})
          </div>
        </div>

        <div className="rounded-xl bg-white p-3">
          <div className="text-[11px] font-medium text-emerald-500">
            ⚡ 가성비 최고 조합
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-800">
            연차 1일당 {bestRatio}일 휴식
          </div>
          <div className="mt-0.5 text-xs text-gray-500">
            {formatRange(mostEfficient.window)} · 연차 {mostEfficient.window.ptoDays}일
          </div>
        </div>

        <div className="rounded-xl bg-white p-3">
          <div className="text-[11px] font-medium text-amber-500">
            🌴 가장 긴 휴식
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-800">
            최대 {totalDays(longest.window)}일 연속
          </div>
          <div className="mt-0.5 text-xs text-gray-500">
            {formatRange(longest.window)}
          </div>
        </div>

        <div className="rounded-xl bg-white p-3">
          <div className="text-[11px] font-medium text-rose-500">🎌 올해 공휴일</div>
          <div className="mt-1 text-sm font-semibold text-gray-800">
            총 {holidays.length}일
          </div>
          <div className="mt-0.5 text-xs text-gray-500">
            추천 {suggestions.length}개 조합 발견
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
        💡 비수기(3·6·11월)에 휴가를 쓰면 같은 연차로도 항공·숙박비를 크게 아낄 수 있어요.
        공휴일과 주말 사이에 연차를 끼워 넣으면 적은 연차로 긴 휴식이 가능합니다.
      </p>
    </section>
  );
}
