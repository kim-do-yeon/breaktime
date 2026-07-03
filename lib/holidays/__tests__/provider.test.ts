import { describe, it, expect } from "vitest";
import {
  koreaHolidayProvider,
  coverageRange,
  dataVersion,
  getHolidaysForYear,
} from "@/lib/holidays/korea";

describe("koreaHolidayProvider", () => {
  describe("coverage metadata", () => {
    it("should have coverageRange 2026–2027", () => {
      expect(coverageRange.minYear).toBe(2026);
      expect(coverageRange.maxYear).toBe(2027);
    });

    it("should have a dataVersion string", () => {
      expect(typeof dataVersion).toBe("string");
      expect(dataVersion.length).toBeGreaterThan(0);
    });
  });

  describe("getHolidays — in-coverage years", () => {
    it("returns ok status for year 2026", async () => {
      const result = await koreaHolidayProvider.getHolidays({
        minYear: 2026,
        maxYear: 2026,
      });
      expect(result.status).toBe("ok");
    });

    it("returns ok status for year 2027", async () => {
      const result = await koreaHolidayProvider.getHolidays({
        minYear: 2027,
        maxYear: 2027,
      });
      expect(result.status).toBe("ok");
    });

    it("returns ok status for range 2026–2027", async () => {
      const result = await koreaHolidayProvider.getHolidays({
        minYear: 2026,
        maxYear: 2027,
      });
      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.holidays.length).toBeGreaterThan(20);
      }
    });
  });

  describe("getHolidays — out-of-coverage years", () => {
    it("returns out-of-coverage for year 2025", async () => {
      const result = await koreaHolidayProvider.getHolidays({
        minYear: 2025,
        maxYear: 2025,
      });
      expect(result.status).toBe("out-of-coverage");
    });

    it("returns out-of-coverage for year 2028", async () => {
      const result = await koreaHolidayProvider.getHolidays({
        minYear: 2028,
        maxYear: 2028,
      });
      expect(result.status).toBe("out-of-coverage");
    });

    it("returns out-of-coverage for range spanning outside coverage", async () => {
      const result = await koreaHolidayProvider.getHolidays({
        minYear: 2026,
        maxYear: 2028,
      });
      expect(result.status).toBe("out-of-coverage");
    });
  });

  describe("2026 holiday dates", () => {
    it("includes New Year's Day 2026-01-01", () => {
      const holidays = getHolidaysForYear(2026);
      const newYear = holidays.find((h) => h.date === "2026-01-01");
      expect(newYear).toBeDefined();
      expect(newYear?.nameKo).toBe("신정");
    });

    it("includes Seollal main day 2026-02-17", () => {
      const holidays = getHolidaysForYear(2026);
      const seollal = holidays.find((h) => h.date === "2026-02-17");
      expect(seollal).toBeDefined();
      expect(seollal?.nameKo).toBe("설날");
    });

    it("includes Seollal eve 2026-02-16 and following day 2026-02-18", () => {
      const holidays = getHolidaysForYear(2026);
      expect(holidays.find((h) => h.date === "2026-02-16")).toBeDefined();
      expect(holidays.find((h) => h.date === "2026-02-18")).toBeDefined();
    });

    it("includes Independence Movement Day substitute 2026-03-02 (03-01 is Sunday)", () => {
      const holidays = getHolidaysForYear(2026);
      const primary = holidays.find((h) => h.date === "2026-03-01");
      expect(primary).toBeDefined();
      const substitute = holidays.find((h) => h.date === "2026-03-02");
      expect(substitute).toBeDefined();
      expect(substitute?.isSubstitute).toBe(true);
    });

    it("includes Children's Day 2026-05-05", () => {
      const holidays = getHolidaysForYear(2026);
      const kidsDay = holidays.find((h) => h.date === "2026-05-05");
      expect(kidsDay).toBeDefined();
      expect(kidsDay?.nameKo).toBe("어린이날");
    });

    it("includes Buddha's Birthday substitute 2026-05-25 (05-24 is Sunday)", () => {
      const holidays = getHolidaysForYear(2026);
      const primary = holidays.find((h) => h.date === "2026-05-24");
      expect(primary).toBeDefined();
      const substitute = holidays.find((h) => h.date === "2026-05-25");
      expect(substitute).toBeDefined();
      expect(substitute?.isSubstitute).toBe(true);
    });

    it("includes Liberation Day substitute 2026-08-17 (08-15 is Saturday)", () => {
      const holidays = getHolidaysForYear(2026);
      const liberation = holidays.find((h) => h.date === "2026-08-15");
      expect(liberation).toBeDefined();
      const substitute = holidays.find((h) => h.date === "2026-08-17");
      expect(substitute).toBeDefined();
      expect(substitute?.isSubstitute).toBe(true);
    });

    it("includes Chuseok main day 2026-09-25 with eve and following day", () => {
      const holidays = getHolidaysForYear(2026);
      expect(holidays.find((h) => h.date === "2026-09-24")).toBeDefined();
      const chuseok = holidays.find((h) => h.date === "2026-09-25");
      expect(chuseok).toBeDefined();
      expect(chuseok?.nameKo).toBe("추석");
      expect(holidays.find((h) => h.date === "2026-09-26")).toBeDefined();
    });

    it("includes Chuseok substitute 2026-09-28 (09-26 is Saturday)", () => {
      const holidays = getHolidaysForYear(2026);
      const substitute = holidays.find((h) => h.date === "2026-09-28");
      expect(substitute).toBeDefined();
      expect(substitute?.isSubstitute).toBe(true);
    });

    it("includes National Foundation Day substitute 2026-10-05 (10-03 is Saturday)", () => {
      const holidays = getHolidaysForYear(2026);
      const primary = holidays.find((h) => h.date === "2026-10-03");
      expect(primary).toBeDefined();
      const substitute = holidays.find((h) => h.date === "2026-10-05");
      expect(substitute).toBeDefined();
      expect(substitute?.isSubstitute).toBe(true);
    });

    it("includes Hangeul Day 2026-10-09", () => {
      const holidays = getHolidaysForYear(2026);
      const hangeul = holidays.find((h) => h.date === "2026-10-09");
      expect(hangeul).toBeDefined();
      expect(hangeul?.nameKo).toBe("한글날");
    });

    it("includes Christmas 2026-12-25", () => {
      const holidays = getHolidaysForYear(2026);
      expect(holidays.find((h) => h.date === "2026-12-25")).toBeDefined();
    });
  });

  describe("2027 holiday dates", () => {
    it("includes New Year's Day 2027-01-01", () => {
      const holidays = getHolidaysForYear(2027);
      expect(holidays.find((h) => h.date === "2027-01-01")).toBeDefined();
    });

    it("includes Seollal main day 2027-02-07 with substitute 2027-02-09", () => {
      const holidays = getHolidaysForYear(2027);
      // Seollal falls on Sunday 2027-02-07, so substitute is 2027-02-09 (Tuesday)
      const seollal = holidays.find((h) => h.date === "2027-02-07");
      expect(seollal).toBeDefined();
      expect(seollal?.nameKo).toBe("설날");
      const substitute = holidays.find((h) => h.date === "2027-02-09");
      expect(substitute).toBeDefined();
      expect(substitute?.isSubstitute).toBe(true);
    });

    it("includes Independence Movement Day 2027-03-01 (Monday — no substitute needed)", () => {
      const holidays = getHolidaysForYear(2027);
      const march1 = holidays.find((h) => h.date === "2027-03-01");
      expect(march1).toBeDefined();
    });

    it("includes Children's Day 2027-05-05", () => {
      const holidays = getHolidaysForYear(2027);
      expect(holidays.find((h) => h.date === "2027-05-05")).toBeDefined();
    });

    it("includes Buddha's Birthday 2027-05-13", () => {
      const holidays = getHolidaysForYear(2027);
      expect(holidays.find((h) => h.date === "2027-05-13")).toBeDefined();
    });

    it("includes Liberation Day substitute 2027-08-16 (08-15 is Sunday)", () => {
      const holidays = getHolidaysForYear(2027);
      const substitute = holidays.find((h) => h.date === "2027-08-16");
      expect(substitute).toBeDefined();
      expect(substitute?.isSubstitute).toBe(true);
    });

    it("includes Chuseok main day 2027-09-15", () => {
      const holidays = getHolidaysForYear(2027);
      const chuseok = holidays.find((h) => h.date === "2027-09-15");
      expect(chuseok).toBeDefined();
      expect(chuseok?.nameKo).toBe("추석");
    });

    it("includes National Foundation Day substitute 2027-10-04 (10-03 is Sunday)", () => {
      const holidays = getHolidaysForYear(2027);
      const substitute = holidays.find((h) => h.date === "2027-10-04");
      expect(substitute).toBeDefined();
      expect(substitute?.isSubstitute).toBe(true);
    });

    it("includes Hangeul Day substitute 2027-10-11 (10-09 is Saturday, 10-10 is Sunday)", () => {
      const holidays = getHolidaysForYear(2027);
      const substitute = holidays.find((h) => h.date === "2027-10-11");
      expect(substitute).toBeDefined();
      expect(substitute?.isSubstitute).toBe(true);
    });

    it("includes Christmas substitute 2027-12-27 (12-25 is Saturday, 12-26 is Sunday)", () => {
      const holidays = getHolidaysForYear(2027);
      const substitute = holidays.find((h) => h.date === "2027-12-27");
      expect(substitute).toBeDefined();
      expect(substitute?.isSubstitute).toBe(true);
    });
  });

  describe("holiday shape", () => {
    it("all 2026 holidays have required fields", () => {
      const holidays = getHolidaysForYear(2026);
      for (const h of holidays) {
        expect(h.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof h.name).toBe("string");
        expect(typeof h.nameKo).toBe("string");
      }
    });

    it("all 2027 holidays have required fields", () => {
      const holidays = getHolidaysForYear(2027);
      for (const h of holidays) {
        expect(h.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof h.name).toBe("string");
        expect(typeof h.nameKo).toBe("string");
      }
    });

    it("substitute holidays have isSubstitute: true", () => {
      const holidays2026 = getHolidaysForYear(2026);
      const substitutes = holidays2026.filter((h) => h.isSubstitute);
      expect(substitutes.length).toBeGreaterThan(0);
      for (const s of substitutes) {
        expect(s.isSubstitute).toBe(true);
      }
    });
  });
});
