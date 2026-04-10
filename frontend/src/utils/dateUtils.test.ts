import { describe, expect, it } from 'vitest'
import {
  calculateAge,
  parseDateOfBirth,
  fromNow,
  isInThePast,
  isInTheFuture,
  dayOfTheWeek,
  fullDateTime,
  shortDateTimeWithTime,
  shortDate,
  fullDateTimeFromNow,
  setToCurrentDate,
  getWeekDay,
  formatDuration,
  shortDateTimeFromNow,
  nexWeekDay,
  dateTimesMatch,
} from './dateUtils'

describe('dateUtils', () => {
  describe('calculateAge', () => {
    it('returns a relative time string', () => {
      const tenYearsAgo = new Date()
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
      const result = calculateAge(tenYearsAgo)
      expect(result).toContain('10')
    })

    it('accepts locale parameter', () => {
      const date = new Date('2000-01-01')
      const result = calculateAge(date, 'es')
      expect(typeof result).toBe('string')
    })
  })

  describe('parseDateOfBirth', () => {
    it('returns formatted date without age', () => {
      const result = parseDateOfBirth(new Date('1990-06-15'))
      expect(result).toBeTruthy()
      expect(result).not.toContain('(')
    })

    it('returns formatted date with age when showAge is true', () => {
      const result = parseDateOfBirth(new Date('1990-06-15'), true)
      expect(result).toContain('(')
    })

    it('accepts locale parameter', () => {
      const result = parseDateOfBirth(new Date('1990-06-15'), false, 'es')
      expect(typeof result).toBe('string')
    })
  })

  describe('fromNow', () => {
    it('returns a relative time string', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 3)
      const result = fromNow(pastDate)
      expect(result).toContain('3 days ago')
    })
  })

  describe('isInThePast', () => {
    it('returns true for past date', () => {
      const pastDate = new Date('2000-01-01')
      expect(isInThePast(pastDate)).toBe(true)
    })

    it('returns false for future date', () => {
      const futureDate = new Date('2099-01-01')
      expect(isInThePast(futureDate)).toBe(false)
    })

    it('accepts allowToday parameter', () => {
      const result = isInThePast(new Date(), true)
      expect(typeof result).toBe('boolean')
    })
  })

  describe('isInTheFuture', () => {
    it('returns true for future date', () => {
      const futureDate = new Date('2099-01-01')
      expect(isInTheFuture(futureDate)).toBe(true)
    })

    it('returns false for past date', () => {
      const pastDate = new Date('2000-01-01')
      expect(isInTheFuture(pastDate)).toBe(false)
    })

    it('accepts allowToday parameter', () => {
      const result = isInTheFuture(new Date(), true)
      expect(typeof result).toBe('boolean')
    })
  })

  describe('dayOfTheWeek', () => {
    it('returns abbreviated day name', () => {
      const result = dayOfTheWeek(0)
      expect(typeof result).toBe('string')
      expect(result.length).toBeLessThanOrEqual(4)
    })
  })

  describe('fullDateTime', () => {
    it('returns a formatted date-time string', () => {
      const result = fullDateTime(new Date('2024-06-15T10:30:00'))
      expect(result).toBeTruthy()
    })
  })

  describe('shortDateTimeWithTime', () => {
    it('returns a short formatted date-time', () => {
      const result = shortDateTimeWithTime(new Date('2024-06-15T10:30:00'))
      expect(result).toBeTruthy()
    })
  })

  describe('shortDate', () => {
    it('returns a short formatted date', () => {
      const result = shortDate(new Date('2024-06-15'))
      expect(result).toBeTruthy()
    })
  })

  describe('fullDateTimeFromNow', () => {
    it('returns formatted date with relative time', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const result = fullDateTimeFromNow(pastDate)
      expect(result).toContain('(')
    })

    it('returns dash for null', () => {
      expect(fullDateTimeFromNow(null)).toBe('-')
    })

    it('returns dash for undefined', () => {
      expect(fullDateTimeFromNow(undefined)).toBe('-')
    })
  })

  describe('shortDateTimeFromNow', () => {
    it('returns short formatted date with relative time', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const result = shortDateTimeFromNow(pastDate)
      expect(result).toContain('(')
    })

    it('returns dash for null', () => {
      expect(shortDateTimeFromNow(null)).toBe('-')
    })

    it('returns dash for undefined', () => {
      expect(shortDateTimeFromNow(undefined)).toBe('-')
    })
  })

  describe('setToCurrentDate', () => {
    it('preserves hours and minutes from input date', () => {
      const result = setToCurrentDate('2024-06-15T14:30:00')
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
    })

    it('accepts Date object', () => {
      const date = new Date('2024-06-15T08:15:00')
      const result = setToCurrentDate(date)
      expect(result.getHours()).toBe(8)
      expect(result.getMinutes()).toBe(15)
    })
  })

  describe('getWeekDay', () => {
    it('returns a number for the day of the week', () => {
      const result = getWeekDay(new Date('2024-06-17')) // Monday
      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(6)
    })
  })

  describe('formatDuration', () => {
    it('formats minutes to HH:mm', () => {
      expect(formatDuration(90)).toBe('01:30')
    })

    it('formats zero minutes', () => {
      expect(formatDuration(0)).toBe('00:00')
    })

    it('formats full hours', () => {
      expect(formatDuration(120)).toBe('02:00')
    })
  })

  describe('nexWeekDay', () => {
    it('returns a dayjs object for the given weekday', () => {
      const result = nexWeekDay(new Date(), 3)
      expect(result.isValid()).toBe(true)
    })
  })

  describe('dateTimesMatch', () => {
    it('returns true when dates match to the minute', () => {
      const d1 = new Date('2024-06-15T10:30:00')
      const d2 = new Date('2024-06-15T10:30:45')
      expect(dateTimesMatch(d1, d2)).toBe(true)
    })

    it('returns false when dates differ by a minute', () => {
      const d1 = new Date('2024-06-15T10:30:00')
      const d2 = new Date('2024-06-15T10:31:00')
      expect(dateTimesMatch(d1, d2)).toBe(false)
    })
  })
})
