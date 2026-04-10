import { describe, expect, it } from 'vitest'
import { generatePassword } from './securityUtils'

describe('generatePassword', () => {
  it('generates a password of default length 12', () => {
    const password = generatePassword()
    expect(password).toHaveLength(12)
  })

  it('generates a password of custom length', () => {
    const password = generatePassword(20)
    expect(password).toHaveLength(20)
  })

  it('generates a password of length 1', () => {
    const password = generatePassword(1)
    expect(password).toHaveLength(1)
  })

  it('only contains characters from the allowed charset', () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    const password = generatePassword(100)
    for (const char of password) {
      expect(charset).toContain(char)
    }
  })

  it('generates different passwords on successive calls', () => {
    const passwords = new Set(Array.from({ length: 10 }, () => generatePassword()))
    expect(passwords.size).toBeGreaterThan(1)
  })
})
