import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const mockAuthContext = vi.fn()

vi.mock('@/contexts/AuthProvider', () => ({
  useAuthContext: () => mockAuthContext(),
}))

import { usePermissions } from './usePermissions'

describe('usePermissions', () => {
  const defaultContext = {
    permissions: ['micro-erp::hr::read', 'micro-erp::hr::write', 'micro-erp::payroll', 'admin'],
    modules: ['hr', 'payroll'],
    loading: false,
    error: undefined,
  }

  function setup(overrides = {}) {
    mockAuthContext.mockReturnValue({ ...defaultContext, ...overrides })
    return renderHook(() => usePermissions())
  }

  describe('hasPermission', () => {
    it('returns true for exact match (case-insensitive)', () => {
      const { result } = setup()
      expect(result.current.hasPermission('Admin')).toBe(true)
      expect(result.current.hasPermission('ADMIN')).toBe(true)
      expect(result.current.hasPermission('admin')).toBe(true)
    })

    it('returns false for non-existent permission', () => {
      const { result } = setup()
      expect(result.current.hasPermission('delete')).toBe(false)
    })

    it('returns false for empty string', () => {
      const { result } = setup()
      expect(result.current.hasPermission('')).toBe(false)
    })

    it('returns false when permissions array is empty', () => {
      const { result } = setup({ permissions: [] })
      expect(result.current.hasPermission('admin')).toBe(false)
    })
  })

  describe('hasModulePermission', () => {
    it('returns true when module matches prefix pattern', () => {
      const { result } = setup()
      expect(result.current.hasModulePermission('hr')).toBe(true)
    })

    it('returns true when module matches exact micro-erp pattern', () => {
      const { result } = setup()
      expect(result.current.hasModulePermission('payroll')).toBe(true)
    })

    it('returns true when module matches as segment (case-insensitive)', () => {
      const { result } = setup()
      expect(result.current.hasModulePermission('HR')).toBe(true)
    })

    it('returns false for non-existent module', () => {
      const { result } = setup()
      expect(result.current.hasModulePermission('billing')).toBe(false)
    })

    it('returns false for empty string', () => {
      const { result } = setup()
      expect(result.current.hasModulePermission('')).toBe(false)
    })

    it('returns false when permissions array is empty', () => {
      const { result } = setup({ permissions: [] })
      expect(result.current.hasModulePermission('hr')).toBe(false)
    })
  })

  describe('hasModule', () => {
    it('returns true when module exists in modules list and has permission', () => {
      const { result } = setup()
      expect(result.current.hasModule('hr')).toBe(true)
    })

    it('returns false when module exists in list but no permission', () => {
      const { result } = setup({ permissions: [] })
      expect(result.current.hasModule('hr')).toBe(false)
    })

    it('returns false when module has permission but not in modules list', () => {
      const { result } = setup({ modules: [] })
      expect(result.current.hasModule('hr')).toBe(false)
    })

    it('returns false for empty string', () => {
      const { result } = setup()
      expect(result.current.hasModule('')).toBe(false)
    })
  })

  describe('returned state', () => {
    it('returns permissions, modules, loading and error from context', () => {
      const error = new Error('test')
      const { result } = setup({ loading: true, error })
      expect(result.current.permissions).toEqual(defaultContext.permissions)
      expect(result.current.modules).toEqual(defaultContext.modules)
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBe(error)
    })
  })
})
