import { describe, expect, it } from 'vitest'
import { cleanPhoneNumber, formatPhoneNumber, getInitials } from './formatters'

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
  })

  describe('getInitials', () => {
    it('returns initials for first and last name', () => {
      expect(getInitials('Ada Lovelace')).toBe('AL')
    })
  })
})
