// "My calendar": shows remaining PTO after added plans, the planned months
// rendered as calendars, and a removable list of plans.
import type { Holiday, Plan } from "@/lib/types";
import { MiniCalendar, CalendarLegend } from "@/components/MiniCalendar";
import { monthsInRange } from "@/lib/calendar";
import { formatRange } from "@/lib/format";

interface MyCalendarProps {
  plans: Plan[];
  year: number;
  totalDays: number;
  holidays: Holiday[];
  onRemove: (index: number) => void;
}

export function MyCalendar({
  plans,
  year,
  totalDays,
  holidays,
  onRemove,
}: MyCalendarProps) {
  const usedDays = plans.reduce((sum, p) => sum + p.ptoDays, 0);
  const remaining = totalDays - usedDays;
  const restDays = plans.reduce((sum, p) => sum + p.totalDays, 0);

  // Months that contain at least one planned vacation.
  const plannedMonths = Array.from(
    new Set(plans.flatMap((p) => monthsInRange(p.start, p.end)))
  ).sort((a, b) => a - b);

  const ranges = plans.map((p) => ({ start: p.start, end: p.end }));
  const usedPct = totalDays > 0 ? Math.min((usedDays / totalDays) * 100, 100) : 0;

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">🗓️ 내 캘린더</h2>
        <span className="text-xs text-gray-500">{year}년</span>
      </div>

      {/* Remaining PTO summary */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white px-2 py-3">
          <div className="text-2xl font-bold text-indigo-600">{remaining}</div>
          <div className="text-[11px] text-gray-500">남은 연차</div>
        </div>
        <div className="rounded-xl bg-white px-2 py-3">
          <div className="text-2xl font-bold text-gray-700">{usedDays}</div>
          <div className="text-[11px] text-gray-500">사용 연차</div>
        </div>
        <div className="rounded-xl bg-white px-2 py-3">
          <div className="text-2xl font-bold text-emerald-600">{restDays}</div>
          <div className="text-[11px] text-gray-500">총 휴식일</div>
        </div>
      </div>

      {/* Usage bar */}
      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-gray-500">
          연차 {totalDays}일 중 {usedDays}일 사용 ({Math.round(usedPct)}%)
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="mt-4 rounded-xl bg-white px-4 py-6 text-center text-xs text-gray-400">
          추천 목록에서 <span className="font-medium text-indigo-500">＋ 내 캘린더에 추가</span>를
          누르면 여기에 휴가 계획이 표시됩니다.
        </p>
      ) : (
        <>
          {/* Planned calendars */}
          <div className="mt-4 space-y-3">
            <CalendarLegend />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {plannedMonths.map((m) => (
                <div key={m} className="rounded-xl bg-white p-3">
                  <MiniCalendar
                    year={year}
                    month={m}
                    holidays={holidays}
                    vacationRanges={ranges}
                    compact
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Plan list */}
          <ul className="mt-4 space-y-2">
            {plans.map((p, i) => (
              <li
                key={`${p.start}-${p.end}`}
                className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-gray-800">
                    {formatRange(p)}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    연차 {p.ptoDays}일 · {p.totalDays}일 휴식
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  aria-label={`${p.start} ~ ${p.end} 계획 삭제`}
                  className="text-xs text-red-500 hover:underline"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
