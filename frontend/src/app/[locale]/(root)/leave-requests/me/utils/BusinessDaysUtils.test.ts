import { calculateEndDate, calculateWorkingDays, isHoliday } from "./BusinessDaysUtils";
import { format } from "date-fns";
import { describe, it, expect } from "vitest";
import { CalculationType } from "@/__generated__/graphql";

describe("BusinessDaysUtils", () => {
  // Use local dates to avoid timezone issues with formatting
  const holidays = ["2023-12-25", "2024-01-01T00:00:00.000Z"];

  describe("isHoliday", () => {
    it("identifies simple YYYY-MM-DD holidays", () => {
      expect(isHoliday(new Date(2023, 11, 25), holidays)).toBe(true);
    });

    it("identifies ISO string holidays from backend", () => {
      expect(isHoliday(new Date(2024, 0, 1), holidays)).toBe(true);
    });

    it("returns false for non-holidays", () => {
      expect(isHoliday(new Date(2023, 11, 24), holidays)).toBe(false);
    });

    it("handles invalid holiday strings gracefully", () => {
      expect(isHoliday(new Date(2023, 11, 25), ["invalid-date"])).toBe(false);
    });
  });

  describe("calculateWorkingDays", () => {
    it("returns 0 if start date is after end date", () => {
      const start = new Date(2023, 9, 25);
      const end = new Date(2023, 9, 24);
      expect(calculateWorkingDays(start, end, [])).toBe(0);
    });

    it("counts inclusive days excluding weekends", () => {
      const start = new Date(2023, 9, 20); // Friday
      const end = new Date(2023, 9, 23); // Monday
      // Fri (1), Sat (X), Sun (X), Mon (2) -> 2 days
      expect(calculateWorkingDays(start, end, [])).toBe(2);
    });

    it("excludes holidays", () => {
      const start = new Date(2023, 11, 22); // Friday
      const end = new Date(2023, 11, 26); // Tuesday
      // Fri (1), Sat (X), Sun (X), Mon (Holiday X), Tue (2) -> 2 days
      expect(calculateWorkingDays(start, end, ["2023-12-25"])).toBe(2);
    });
  });

  describe("calculateEndDate", () => {
    describe("WORKING_DAYS", () => {
      it("should return the same day for 1 unit", () => {
        const start = new Date(2023, 9, 23); // Monday Oct 23
        const result = calculateEndDate(start, 1, []);
        expect(format(result, "yyyy-MM-dd")).toBe("2023-10-23");
      });

      it("should return Tuesday for 2 units starting Monday", () => {
        const start = new Date(2023, 9, 23); // Monday
        const result = calculateEndDate(start, 2, []);
        expect(format(result, "yyyy-MM-dd")).toBe("2023-10-24");
      });

      it("should skip weekends: Friday with 2 units should return Monday", () => {
        const start = new Date(2023, 9, 20); // Friday
        const result = calculateEndDate(start, 2, []);
        expect(format(result, "yyyy-MM-dd")).toBe("2023-10-23");
      });

      it("should skip holidays: Monday with 2 units and Tuesday is holiday should return Wednesday", () => {
        const start = new Date(2023, 9, 23); // Monday
        const result = calculateEndDate(start, 2, ["2023-10-24"]);
        expect(format(result, "yyyy-MM-dd")).toBe("2023-10-25");
      });

      it("should handle mixed holidays and weekends: Friday with 2 units and Monday is holiday should return Tuesday", () => {
        const start = new Date(2023, 9, 20); // Friday
        const result = calculateEndDate(start, 2, ["2023-10-23"]);
        expect(format(result, "yyyy-MM-dd")).toBe("2023-10-24");
      });
    });

    describe("CALENDAR_DAYS", () => {
      it("should return the same day for 1 unit", () => {
        const start = new Date(2023, 9, 23);
        const result = calculateEndDate(start, 1, [], CalculationType.CalendarDays);
        expect(format(result, "yyyy-MM-dd")).toBe("2023-10-23");
      });

      it("should NOT skip weekends: Friday with 2 units should return Saturday", () => {
        const start = new Date(2023, 9, 20); // Friday
        const result = calculateEndDate(start, 2, [], CalculationType.CalendarDays);
        expect(format(result, "yyyy-MM-dd")).toBe("2023-10-21");
      });

      it("should handle multi-day requests correctly", () => {
        const start = new Date(2023, 9, 23);
        const result = calculateEndDate(start, 5, [], CalculationType.CalendarDays);
        expect(format(result, "yyyy-MM-dd")).toBe("2023-10-27");
      });
    });
  });
});
