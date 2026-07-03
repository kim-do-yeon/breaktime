// Display + export helpers for vacation suggestions.
import type { Suggestion, VacationWindow } from "@/lib/types";

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

/** Format an ISO date (YYYY-MM-DD) as "9월 24일 (목)". */
export function formatKoreanDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = WEEKDAYS_KO[d.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

/** Format a date range as "9월 24일 (목) ~ 9월 30일 (수)". */
export function formatRange(range: { start: string; end: string }): string {
  return `${formatKoreanDate(range.start)} ~ ${formatKoreanDate(range.end)}`;
}

/** Total number of days in the window (inclusive). */
export function totalDays(w: VacationWindow): number {
  const start = new Date(w.start + "T00:00:00Z").getTime();
  const end = new Date(w.end + "T00:00:00Z").getTime();
  return Math.round((end - start) / 86400000) + 1;
}

/** Plain-text summary suitable for clipboard copy. */
export function suggestionToText(s: Suggestion): string {
  const w = s.window;
  const holidayNames = w.holidays.map((h) => h.nameKo).join(", ") || "없음";
  return [
    `📅 휴가 기간: ${formatRange(w)}`,
    `총 ${totalDays(w)}일 휴식 (연차 ${w.ptoDays}일 사용)`,
    `점수: ${s.score}/100`,
    `포함 공휴일: ${holidayNames}`,
  ].join("\n");
}

/** Build a minimal iCalendar VEVENT string for a suggestion (all-day event). */
export function suggestionToIcs(s: Suggestion): string {
  const w = s.window;
  const dtStart = w.start.replace(/-/g, "");
  // DTEND is exclusive for all-day events → add one day to the end date.
  const endDate = new Date(w.end + "T00:00:00Z");
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const dtEnd = endDate.toISOString().slice(0, 10).replace(/-/g, "");
  const uid = `${dtStart}-${dtEnd}@breaktime`;
  const dtStamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//breaktime//vacation-planner//KO",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:휴가 (${totalDays(w)}일, 연차 ${w.ptoDays}일)`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
