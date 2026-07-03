// Year-at-a-glance calendar: 12 months tinted by season, with recommended
// windows filled (indigo) and the user's added plans ringed (emerald).
import type { Holiday, Suggestion, Plan } from "@/lib/types";
import { getMonthMatrix, isWithin, WEEKDAY_HEADERS_KO } from "@/lib/calendar";
import { getSeasonInfo, type SeasonTier } from "@/data/seasonality-kr";

const MONTH_NAMES_KO = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

/** Very light month-background tint by season tier. */
const SEASON_TINT: Record<SeasonTier, string> = {
  peak: "bg-rose-50 border-rose-100",
  shoulder: "bg-amber-50 border-amber-100",
  off: "bg-emerald-50 border-emerald-100",
};
const SEASON_CHIP: Record<SeasonTier, string> = {
  peak: "text-rose-600",
  shoulder: "text-amber-600",
  off: "text-emerald-600",
};

interface YearCalendarProps {
  year: number;
  holidays: Holiday[];
  /** Recommended windows currently shown (highlighted indigo). */
  suggestions: Suggestion[];
  /** User's added plans (ringed emerald). */
  plans: Plan[];
}

export function YearCalendar({
  year,
  holidays,
  suggestions,
  plans,
}: YearCalendarProps) {
  const recRanges = suggestions.map((s) => ({
    start: s.window.start,
    end: s.window.end,
  }));
  const planRanges = plans.map((p) => ({ start: p.start, end: p.end }));

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-800">
          📆 {year}년 한눈에 보기
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-indigo-600" /> 추천 연차
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-indigo-100" /> 추천 주말·공휴일
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded ring-2 ring-emerald-500" /> 내가 추가
          </span>
        </div>
      </div>

      {/* Season legend */}
      <div className="mb-4 flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-600">
          ● 성수기(비쌈)
        </span>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-600">
          ● 준성수기
        </span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
          ● 비수기(저렴)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {MONTH_NAMES_KO.map((name, i) => {
          const month = i + 1;
          const info = getSeasonInfo(month);
          const tier = info?.tier ?? "shoulder";
          const weeks = getMonthMatrix(year, month, holidays);

          return (
            <div
              key={month}
              className={`rounded-xl border p-2 ${SEASON_TINT[tier]}`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">{name}</span>
                <span className={`text-[10px] font-medium ${SEASON_CHIP[tier]}`}>
                  {info?.tierLabel}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {WEEKDAY_HEADERS_KO.map((d, di) => (
                  <div
                    key={d}
                    className={`text-center text-[9px] ${
                      di === 0
                        ? "text-red-400"
                        : di === 6
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    {d}
                  </div>
                ))}
                {weeks.flat().map((c, idx) => {
                  if (!c.inMonth) {
                    return <div key={`${c.date}-${idx}`} className="h-5" />;
                  }
                  const restDay = c.isWeekend || c.isHoliday;
                  const inRec = recRanges.some((r) =>
                    isWithin(c.date, r.start, r.end)
                  );
                  const inPlan = planRanges.some((r) =>
                    isWithin(c.date, r.start, r.end)
                  );

                  let cls = c.isHoliday
                    ? "text-red-500"
                    : c.isWeekend
                    ? "text-gray-400"
                    : "text-gray-700";
                  if (inRec && !restDay) cls = "bg-indigo-600 text-white font-semibold";
                  else if (inRec && restDay) cls = "bg-indigo-100 text-indigo-700";

                  const ring = inPlan ? "ring-2 ring-emerald-500 ring-inset" : "";

                  return (
                    <div
                      key={`${c.date}-${idx}`}
                      title={c.holidayName ?? undefined}
                      className={`flex h-5 items-center justify-center rounded text-[10px] ${cls} ${ring}`}
                    >
                      {c.day}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
