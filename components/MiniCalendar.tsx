// A compact month calendar that highlights vacation windows.
// PTO days (연차 사용) render solid; free rest days (weekend/holiday inside the
// window) render light — visually showing the "leverage" of a window.
import type { Holiday } from "@/lib/types";
import {
  getMonthMatrix,
  isWithin,
  WEEKDAY_HEADERS_KO,
} from "@/lib/calendar";

const MONTH_NAMES_KO = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export interface VacationRange {
  start: string;
  end: string;
}

interface MiniCalendarProps {
  year: number;
  month: number;
  holidays: Holiday[];
  /** Ranges to highlight as vacation. */
  vacationRanges: VacationRange[];
  /** Compact mode reduces cell size for embedding in cards. */
  compact?: boolean;
}

export function MiniCalendar({
  year,
  month,
  holidays,
  vacationRanges,
  compact = false,
}: MiniCalendarProps) {
  const weeks = getMonthMatrix(year, month, holidays);
  const cell = compact ? "h-7 text-[11px]" : "h-9 text-xs";

  return (
    <div className="select-none">
      <div className="mb-1.5 text-center text-xs font-semibold text-gray-700">
        {year}년 {MONTH_NAMES_KO[month - 1]}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAY_HEADERS_KO.map((d, i) => (
          <div
            key={d}
            className={`text-center text-[10px] font-medium ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
            }`}
          >
            {d}
          </div>
        ))}
        {weeks.flat().map((c, idx) => {
          const inVacation =
            c.inMonth &&
            vacationRanges.some((r) => isWithin(c.date, r.start, r.end));
          const isRestDay = c.isWeekend || c.isHoliday;
          const ptoUsed = inVacation && !isRestDay;
          const restInVacation = inVacation && isRestDay;

          let cls = "text-gray-300"; // padding default
          if (c.inMonth) {
            if (ptoUsed) {
              cls = "bg-indigo-600 text-white font-semibold rounded-md";
            } else if (restInVacation) {
              cls = "bg-indigo-100 text-indigo-700 font-medium rounded-md";
            } else if (c.isHoliday) {
              cls = "text-red-500 font-medium";
            } else if (c.isWeekend) {
              cls = "text-gray-400";
            } else {
              cls = "text-gray-700";
            }
          }

          return (
            <div
              key={`${c.date}-${idx}`}
              title={c.holidayName ?? undefined}
              className={`flex items-center justify-center ${cell} ${cls}`}
            >
              {c.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Small legend explaining the calendar colors. */
export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
      <span className="flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded bg-indigo-600" /> 연차 사용
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded bg-indigo-100" /> 주말·공휴일
      </span>
      <span className="flex items-center gap-1">
        <span className="text-red-500">■</span> 공휴일
      </span>
    </div>
  );
}
