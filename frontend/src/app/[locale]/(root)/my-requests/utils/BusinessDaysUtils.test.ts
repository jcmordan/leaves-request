import { calculateEndDate } from "./BusinessDaysUtils";
import dayjs from "dayjs";
import { describe, it, expect } from "vitest";
import { CalculationType } from "@/__generated__/graphql";

describe("BusinessDaysUtils", () => {
  const Monday = new Date(2026, 3, 13); // Monday April 13, 2026
  const Friday = new Date(2026, 3, 17); // Friday April 17, 2026
  const holidays: string[] = [];

  describe("calculateEndDate", () => {
    describe("WORKING_DAYS", () => {
      it("should return the same day for 1 unit (Monday)", () => {
        const result = calculateEndDate(Monday, 1, holidays, CalculationType.WorkingDays);
        expect(dayjs(result).isSame(Monday, "day")).toBe(true);
      });

      it("should return Tuesday for 2 units starting Monday", () => {
        const result = calculateEndDate(Monday, 2, holidays, CalculationType.WorkingDays);
        const Tuesday = dayjs(Monday).add(1, "day");
        expect(dayjs(result).isSame(Tuesday, "day")).toBe(true);
      });

      it("should skip weekends: Friday with 2 units should return Monday", () => {
        const result = calculateEndDate(Friday, 2, holidays, CalculationType.WorkingDays);
        const NextMonday = dayjs(Friday).add(3, "day"); // Sat, Sun, Mon
        expect(dayjs(result).isSame(NextMonday, "day")).toBe(true);
      });

      it("should skip holidays: Monday with 2 units and Tuesday is holiday should return Wednesday", () => {
        const TuesdayStr = "2026-04-14";
        const result = calculateEndDate(Monday, 2, [TuesdayStr], CalculationType.WorkingDays);
        const Wednesday = dayjs(Monday).add(2, "day");
        expect(dayjs(result).isSame(Wednesday, "day")).toBe(true);
      });

      it("should handle mixed holidays and weekends: Friday with 2 units and Monday is holiday should return Tuesday", () => {
        const MondayHolidayStr = "2026-04-20";
        const FridayStartDate = new Date(2026, 3, 17); // Friday April 17
        const result = calculateEndDate(FridayStartDate, 2, [MondayHolidayStr], CalculationType.WorkingDays);
        
        // Friday (1), Sat/Sun (X), Mon-Holiday (X), Tue (2)
        const TuesdayResult = dayjs(FridayStartDate).add(4, "day");
        expect(dayjs(result).isSame(TuesdayResult, "day")).toBe(true);
      });
    });

    describe("CALENDAR_DAYS", () => {
      it("should return the same day for 1 unit", () => {
        const result = calculateEndDate(Monday, 1, holidays, CalculationType.CalendarDays);
        expect(dayjs(result).isSame(Monday, "day")).toBe(true);
      });

      it("should NOT skip weekends: Friday with 2 units should return Saturday", () => {
        const result = calculateEndDate(Friday, 2, holidays, CalculationType.CalendarDays);
        const Saturday = dayjs(Friday).add(1, "day");
        expect(dayjs(result).isSame(Saturday, "day")).toBe(true);
      });

      it("should handle multi-day requests correctly", () => {
        const result = calculateEndDate(Monday, 5, holidays, CalculationType.CalendarDays);
        const FridayResult = dayjs(Monday).add(4, "day");
        expect(dayjs(result).isSame(FridayResult, "day")).toBe(true);
      });
    });
  });
});
