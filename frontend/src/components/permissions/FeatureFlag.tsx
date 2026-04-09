'use client'

import { ReactNode } from 'react'

import { usePermissions } from '@/hooks/usePermissions'

type FeatureFlagProps = {
  permission?: string
  module?: string
  children: ReactNode
}

export function FeatureFlag({ permission, module, children }: Readonly<FeatureFlagProps>) {
  const { hasPermission, hasModule } = usePermissions()

  if (!permission && !module) {
    return null
  }

  if (permission !== undefined) {
    if (!permission || !hasPermission(permission)) {
      return null
    }
  }

  if (module !== undefined) {
    if (!module || !hasModule(module)) {
      return null
    }
  }

  return <>{children}</>
}
