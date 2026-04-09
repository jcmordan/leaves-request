'use client'

import { useCallback } from 'react'

import { useAuthContext } from '@/contexts/AuthProvider'

export interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean
  hasModule: (module: string) => boolean
  hasModulePermission: (module: string) => boolean
  permissions: string[]
  modules: string[]
  loading: boolean
  error?: Error
}

export function usePermissions(): UsePermissionsReturn {
  const { permissions, modules, loading, error } = useAuthContext()

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!permission || permissions.length === 0) {
        return false
      }

      return permissions.some(
        p => p.localeCompare(permission, undefined, { sensitivity: 'base' }) === 0
      )
    },
    [permissions]
  )

  const microErpPrefix = 'micro-erp::'

  const hasModulePermission = useCallback(
    (module: string): boolean => {
      if (!module || permissions.length === 0) {
        return false
      }

      const lowerModule = module.toLowerCase()
      const permissionMatches = permissions.some(p => {
        const lowerP = p.toLowerCase()
        if (
          lowerP.startsWith(`${microErpPrefix}${lowerModule}::`) ||
          lowerP === `${microErpPrefix}${lowerModule}`
        ) {
          return true
        }

        const segments = lowerP.replace(microErpPrefix, '').split('::')

        return segments.includes(lowerModule)
      })

      return permissionMatches
    },
    [permissions]
  )

  const hasModule = useCallback(
    (module: string): boolean => {
      if (!module || modules.length === 0) {
        return false
      }

      return (
        modules.some(m => m.toLowerCase() === module.toLowerCase()) && hasModulePermission(module)
      )
    },
    [modules, hasModulePermission]
  )

  return {
    hasPermission,
    hasModule,
    hasModulePermission,
    permissions,
    modules,
    loading,
    error,
  }
}
