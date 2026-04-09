'use client'

import { useQuery } from '@apollo/client'
import { SessionProvider, useSession } from 'next-auth/react'
import React, { createContext, useContext, useMemo } from 'react'

import { VIEWER_PERMISSIONS_QUERY } from '@/lib/permissions/queries'

type Tenant = {
  id: string
  name: string
  logoUrl: string
  modules: string[]
}

interface AuthContextValue {
  permissions: string[]
  modules: string[]
  tenant: Tenant
  currentTenant: Tenant | null
  loading: boolean
  error?: Error
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function PermissionsFetcher({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const { data, error } = useQuery(VIEWER_PERMISSIONS_QUERY, {
    skip: !isAuthenticated,
    errorPolicy: 'all',
  })

  const value = useMemo<AuthContextValue>(() => {
    const viewer = data?.viewer as Record<string, unknown> | undefined
    const _tenant = viewer?.tenant as Record<string, unknown> | undefined

    const userProfile = viewer?.userProfile as Record<string, unknown> | undefined
    const rawPermissions = (userProfile?.permissions ?? []) as Array<{ name?: string }>
    const permissions = rawPermissions.map(p => p?.name).filter((n): n is string => !!n)

    const rawModules = (_tenant?.modules ?? []) as Array<{ name?: string }>
    const modules = rawModules.map(m => m?.name).filter((n): n is string => !!n)

    const tenant: Tenant = {
      id: (_tenant?.id as string) ?? '',
      name: (_tenant?.name as string) ?? '',
      logoUrl: (_tenant?.logoUrl as string) ?? '',
      modules,
    }

    return {
      tenant,
      currentTenant: tenant,
      permissions,
      modules,
      loading: (status === 'loading' || (isAuthenticated && !data)) && !error,
      error: error as Error | undefined,
    }
  }, [data, error, isAuthenticated, status])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  return <PermissionsFetcher>{children}</PermissionsFetcher>
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error(
      'useAuthContext must be used within a PermissionsProvider. Make sure PermissionsProvider is wrapped by AuthProvider and ApolloClientProvider.'
    )
  }

  return context
}
