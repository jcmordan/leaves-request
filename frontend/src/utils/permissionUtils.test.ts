import { describe, expect, it } from 'vitest'
import { groupPermissions, type Permission } from './permissionUtils'

describe('groupPermissions', () => {
  const permissions: Permission[] = [
    { id: '1', name: 'system::hr::employee::view', description: 'View employees' },
    { id: '2', name: 'system::hr::employee::edit', description: 'Edit employees' },
    { id: '3', name: 'system::finance::invoice::view', description: 'View invoices' },
    { id: '4', name: 'system::finance::invoice::create', description: 'Create invoices' },
  ]

  it('groups permissions by module and entity', () => {
    const result = groupPermissions(permissions)
    expect(result).toHaveProperty('hr')
    expect(result).toHaveProperty('finance')
    expect(result.hr).toHaveProperty('employee')
    expect(result.finance).toHaveProperty('invoice')
  })

  it('marks active permissions as selected', () => {
    const result = groupPermissions(permissions, ['1', '3'])
    const viewEmployee = result.hr.employee.find(p => p.id === '1')
    const editEmployee = result.hr.employee.find(p => p.id === '2')
    expect(viewEmployee?.isSelected).toBe(true)
    expect(editEmployee?.isSelected).toBe(false)
  })

  it('sorts view permissions first', () => {
    const result = groupPermissions(permissions)
    const employeePerms = result.hr.employee
    expect(employeePerms[0].name).toContain('view')
  })

  it('returns empty object for null permissions', () => {
    expect(groupPermissions(null)).toEqual({})
  })

  it('returns empty object for undefined permissions', () => {
    expect(groupPermissions(undefined)).toEqual({})
  })

  it('defaults activePermissionIds to empty array', () => {
    const result = groupPermissions(permissions)
    const allUnselected = result.hr.employee.every(p => !p.isSelected)
    expect(allUnselected).toBe(true)
  })

  it('skips permissions with fewer than 3 parts', () => {
    const badPermissions: Permission[] = [
      { id: '1', name: 'invalid::format', description: null },
      { id: '2', name: 'system::hr::employee::view', description: 'View' },
    ]
    const result = groupPermissions(badPermissions)
    expect(Object.keys(result)).toEqual(['hr'])
  })
})
