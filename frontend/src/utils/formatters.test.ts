import { describe, expect, it } from 'vitest'
import {
  cleanPhoneNumber,
  formatPhoneNumber,
  formatPercentage,
  formatCurrency,
  formatDate,
  formatNationalId,
  getInitials,
} from './formatters'

describe('formatters', () => {
  describe('cleanPhoneNumber', () => {
    it('cleans non-digit characters from a phone number', () => {
      expect(cleanPhoneNumber('(829) 555-0101')).toBe('8295550101')
    })
  })

  describe('formatPhoneNumber', () => {
    it('formats a valid 10-digit phone number', () => {
      expect(formatPhoneNumber('8295550101')).toBe('(829) 555-0101')
    })

    it('returns original string when not 10 digits', () => {
      expect(formatPhoneNumber('123')).toBe('123')
    })
  })

  describe('getInitials', () => {
    it('returns initials for first and last name', () => {
      expect(getInitials('Ada Lovelace')).toBe('AL')
    })

    it('returns single initial for single name', () => {
      expect(getInitials('Ada')).toBe('A')
    })
  })

  describe('formatPercentage', () => {
    it('formats a number as percentage', () => {
      const result = formatPercentage(0.75)
      expect(result).toContain('75')
    })

    it('returns dash for null', () => {
      expect(formatPercentage(null)).toBe('-')
    })

    it('returns dash for undefined', () => {
      expect(formatPercentage(undefined)).toBe('-')
    })

    it('formats zero correctly', () => {
      const result = formatPercentage(0)
      expect(result).toContain('0')
    })
  })

  describe('formatCurrency', () => {
    it('formats a number as currency', () => {
      const result = formatCurrency(1000)
      expect(result).toBeTruthy()
      expect(result).not.toBe('-')
    })

    it('returns dash for null', () => {
      expect(formatCurrency(null)).toBe('-')
    })

    it('returns dash for undefined', () => {
      expect(formatCurrency(undefined)).toBe('-')
    })

    it('accepts custom currency', () => {
      const result = formatCurrency(500, 'USD')
      expect(result).not.toBe('-')
    })

    it('formats zero correctly', () => {
      const result = formatCurrency(0)
      expect(result).not.toBe('-')
    })
  })

  describe('formatDate', () => {
    it('formats a valid date string', () => {
      const result = formatDate('2024-01-15')
      expect(result).not.toBe('-')
    })

    it('formats a Date object', () => {
      const result = formatDate(new Date('2024-06-15T10:30:00'))
      expect(result).not.toBe('-')
    })

    it('returns fallback for null', () => {
      expect(formatDate(null)).toBe('-')
    })

    it('returns fallback for undefined', () => {
      expect(formatDate(undefined)).toBe('-')
    })

    it('returns fallback for empty string', () => {
      expect(formatDate('')).toBe('-')
    })

    it('returns custom fallback', () => {
      expect(formatDate(null, 'PPp', 'N/A')).toBe('N/A')
    })

    it('returns fallback for invalid date', () => {
      expect(formatDate('not-a-date')).toBe('-')
    })

    it('returns fallback for year <= 1', () => {
      expect(formatDate(new Date('0001-01-01'))).toBe('-')
    })

    it('uses custom format string', () => {
      const result = formatDate('2024-01-15', 'yyyy')
      expect(result).toBe('2024')
    })
  })

  describe('formatNationalId', () => {
    it('formats valid 11-digit cédula', () => {
      expect(formatNationalId('00112345678')).toBe('001-1234567-8')
    })

    it('strips non-digit characters before formatting', () => {
      expect(formatNationalId('001-1234567-8')).toBe('001-1234567-8')
    })

    it('returns error message for invalid length', () => {
      expect(formatNationalId('12345')).toBe('Invalid length; must be 11 digits.')
    })
  })
})
