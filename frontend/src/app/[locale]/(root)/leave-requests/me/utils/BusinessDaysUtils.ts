import { CalculationType } from "@/__generated__/graphql";
import { addDays, format, isWeekend, parseISO, startOfDay } from "date-fns";

import dayjs from "dayjs";
import businessDays from "dayjs-business-days2";

/**
 * Checks if a given date is a holiday based on a provided list.
 */
export const isHoliday = (date: Date, holidays: string[]): boolean => {
  const dateStr = format(date, "yyyy-MM-dd");
  return holidays.some((holyday) => {
    try {
      // If it's already a YYYY-MM-DD string, just compare
      if (/^\d{4}-\d{2}-\d{2}$/.test(holyday)) {
        return holyday === dateStr;
      }
      // For ISO strings, we want to match the date part in UTC to avoid TZ shifts
      const parsed = parseISO(holyday);
      return format(parsed, "yyyy-MM-dd") === dateStr || 
             holyday.startsWith(dateStr);
    } catch {
      return false;
    }
  });
};

/**
 * Calculates the number of working days between two dates, inclusive.
 * Excludes weekends (Sat/Sun) and provided holidays.
 */
export const calculateWorkingDays = (
  startDate: Date,
  endDate: Date,
  holidays: string[],
): number => {
  if (startDate > endDate) return 0;

  dayjs.extend(businessDays, {
    holidays,
    // holidayFormat: "YYYY-MM-DD",
  });

  let count = 0;
  let current = startOfDay(startDate);
  const end = startOfDay(endDate);

  while (current <= end) {
    if (!isWeekend(current) && !isHoliday(current, holidays)) {
      count++;
    }
    current = addDays(current, 1);
  }

  return count;
};

/**
 * Calculates the end date given a start date and a number of units (days).
 * Supports both Working Days (skipping weekends/holidays) and Calendar Days.
 * Uses an "inclusive" logic where 1 unit starting on Monday ends on Monday.
 */
export const calculateEndDate = (
  startDate: Date,
  units: number,
  holidays: string[],
  calculationType: CalculationType = CalculationType.WorkingDays,
): Date => {
  let current = startOfDay(startDate);
  let businessDaysCount = 0;

  if (calculationType === CalculationType.CalendarDays) {
    return addDays(current, units - 1);
  }

  // Inclusive logic: find the Nth business day
  while (businessDaysCount < units) {
    const dayIsWeekend = isWeekend(current);
    const dayIsHoliday = isHoliday(current, holidays);

    if (!dayIsWeekend && !dayIsHoliday) {
      businessDaysCount++;
    }

    if (businessDaysCount < units) {
      current = addDays(current, 1);
    }
  }

  return current;
};
