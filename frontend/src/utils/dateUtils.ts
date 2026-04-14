import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import weekday from "dayjs/plugin/weekday";
import "dayjs/locale/es";
import "dayjs/locale/en";

dayjs.extend(duration);
dayjs.extend(weekday);
dayjs.extend(LocalizedFormat);
dayjs.extend(relativeTime);

export const calculateAge = (
  dateOfBirth: Date | string,
  locale: "en" | "es" = "en",
) => {
  return dayjs(dateOfBirth).locale(locale).to(dayjs().locale(locale), true);
};

export const parseDateOfBirth = (
  date: Date | string,
  showAge = false,
  locale: "en" | "es" = "en",
) => {
  const dateOfBirth = dayjs(date).locale(locale);
  const formattedDate = dateOfBirth.format("ll");

  if (showAge) {
    const age = calculateAge(date, locale);

    return `${formattedDate} (${age})`;
  }

  return formattedDate;
};

export const fromNow = (date: Date) => {
  return dayjs(date).fromNow();
};

export const isInThePast = (date: Date, allowToday?: boolean) => {
  return dayjs(date).isBefore(new Date(), allowToday ? "hours" : undefined);
};

export const isInTheFuture = (date: Date, allowToday?: boolean) => {
  return dayjs(date).isAfter(new Date(), allowToday ? "day" : undefined);
};

export const dayOfTheWeek = (day: number) => dayjs().day(day).format("ddd");

export const nexWeekDay = (date: Date, day: number) => {
  const _day = dayjs().get("day") > day ? day + 7 : day;

  return dayjs(date).day(_day);
};

export const fullDateTime = (date: Date) => dayjs(date).format("llll");

export const shortDateTimeWithTime = (date: Date) => dayjs(date).format("lll");

export const shortDate = (date: Date) => dayjs(date).format("ll");

export const fullDateTimeFromNow = (date?: Date | null) =>
  date ? `${fullDateTime(date)} (${fromNow(date)})` : "-";

export const setToCurrentDate = (date: Date | string) => {
  const _date = new Date(date);

  return dayjs()
    .set("hour", _date.getHours())
    .set("minutes", _date.getMinutes())
    .toDate();
};

export const getWeekDay = (date: Date) => {
  return dayjs(date).weekday();
};

export const formatDuration = (minutes: number) => {
  return dayjs.duration(minutes, "minutes").format("HH:mm");
};

export const shortDateTimeFromNow = (date?: Date | null) =>
  date ? `${shortDateTimeWithTime(date)} (${fromNow(date)})` : "-";

export const dateTimesMatch = (date1: Date, date2: Date) => {
  return dayjs(date1).isSame(dayjs(date2), "minute");
};

export const daysBetween = (date1: Date, date2: Date) => {
  return dayjs(date2).diff(dayjs(date1), "day");
};


