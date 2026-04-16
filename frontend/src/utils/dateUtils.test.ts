import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateAge,
  parseDateOfBirth,
  fromNow,
  isInThePast,
  isInTheFuture,
  dayOfTheWeek,
  nexWeekDay,
  fullDateTime,
  fullDateTimeFromNow,
  setToCurrentDate,
  getWeekDay,
  formatDuration,
  shortDateTimeFromNow,
  dateTimesMatch,
  daysBetween,
} from "./dateUtils";
import dayjs from "dayjs";

describe("dateUtils", () => {
  const mockNow = new Date("2026-04-16T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("calculateAge", () => {
    it("should calculate age correctly in English", () => {
      const dob = "1990-01-01";
      const age = calculateAge(dob, "en");
      // April 2026 - Jan 1990 = ~36 years
      expect(age).toContain("36 years");
    });

    it("should calculate age correctly in Spanish", () => {
      const dob = "1990-01-01";
      const age = calculateAge(dob, "es");
      expect(age).toContain("36 años");
    });
  });

  describe("parseDateOfBirth", () => {
    it("should format date of birth correctly without age", () => {
      const dob = "1990-05-15";
      const result = parseDateOfBirth(dob, false, "en");
      expect(result).toBe("May 15, 1990");
    });

    it("should format date of birth and include age", () => {
      const dob = "1990-05-15";
      const result = parseDateOfBirth(dob, true, "en");
      expect(result).toContain("May 15, 1990");
      expect(result).toContain("36 years");
    });
  });

  describe("fromNow", () => {
    it("should return relative time from now", () => {
      const pastDate = new Date("2026-04-15T12:00:00Z");
      expect(fromNow(pastDate)).toBe("a day ago");
    });
  });

  describe("isInThePast", () => {
    it("should return true for a date in the past", () => {
      const pastDate = new Date("2026-04-15T00:00:00Z");
      expect(isInThePast(pastDate)).toBe(true);
    });

    it("should return false for a date in the future", () => {
      const futureDate = new Date("2026-04-17T00:00:00Z");
      expect(isInThePast(futureDate)).toBe(false);
    });
  });

  describe("isInTheFuture", () => {
    it("should return true for a date in the future", () => {
      const futureDate = new Date("2026-04-17T00:00:00Z");
      expect(isInTheFuture(futureDate)).toBe(true);
    });
  });

  describe("dayOfTheWeek", () => {
    it("should return the correct short name of the day", () => {
      // 0 is Sunday, 1 is Monday... 4 is Thursday (mockNow is April 16 2026, which is a Thursday)
      expect(dayOfTheWeek(4)).toBe("Thu");
    });
  });

  describe("nexWeekDay", () => {
    it("should return the next occurring weekday if in the past this week", () => {
      const date = new Date("2026-04-16T12:00:00Z"); // Thursday
      const nextMonday = nexWeekDay(date, 1); // 1 = Monday
      expect(nextMonday.format("YYYY-MM-DD")).toBe("2026-04-20");
    });
  });

  describe("fullDateTime", () => {
    it("should format to long date time", () => {
      const date = new Date("2026-04-16T14:30:00Z");
      expect(fullDateTime(date)).toContain("Apr 16, 2026");
    });
  });

  describe("setToCurrentDate", () => {
    it("should preserve time but change date to today", () => {
      const someDate = "2020-01-01T10:00:00";
      const result = setToCurrentDate(someDate);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(3); // April is 3
      expect(result.getDate()).toBe(16);
      expect(result.getHours()).toBe(10);
    });
  });

  describe("formatDuration", () => {
    it("should format minutes to HH:mm", () => {
      expect(formatDuration(90)).toBe("01:30");
      expect(formatDuration(1440)).toBe("00:00"); // 24 hours
    });
  });

  describe("daysBetween", () => {
    it("should calculate correct number of inclusive days", () => {
      const d1 = new Date(2026, 3, 1);
      const d2 = new Date(2026, 3, 5);
      expect(daysBetween(d1, d2)).toBe(5);
    });

    it("should return 1 for the same day", () => {
      const d1 = new Date(2026, 3, 1);
      expect(daysBetween(d1, d1)).toBe(1);
    });
  });

  describe("dateTimesMatch", () => {
    it("should return true for matching minutes", () => {
      const d1 = new Date("2026-04-16T10:00:00Z");
      const d2 = new Date("2026-04-16T10:00:30Z");
      expect(dateTimesMatch(d1, d2)).toBe(true);
    });

    it("should return false for different minutes", () => {
      const d1 = new Date("2026-04-16T10:00:00Z");
      const d2 = new Date("2026-04-16T10:01:00Z");
      expect(dateTimesMatch(d1, d2)).toBe(false);
    });
  });

  describe("getWeekDay", () => {
    it("should return the correct weekday index", () => {
      const date = new Date(2026, 3, 16); // Thursday, April 16 2026
      expect(getWeekDay(date)).toBe(4);
    });
  });

  describe("fullDateTimeFromNow", () => {
    it("should return formatted date and relative time", () => {
      const date = new Date("2026-04-15T12:00:00Z");
      const result = fullDateTimeFromNow(date);
      expect(result).toContain("a day ago");
    });

    it("should return '-' for null date", () => {
      expect(fullDateTimeFromNow(null)).toBe("-");
    });
  });

  describe("shortDateTimeFromNow", () => {
    it("should return formatted short date and relative time", () => {
      const date = new Date("2026-04-15T12:00:00Z");
      const result = shortDateTimeFromNow(date);
      expect(result).toContain("a day ago");
    });
  });
});
