import { type RenderOptions, render, renderHook } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import React, { type ReactElement, type ReactNode } from 'react'

import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { AuthContext, PermissionsProvider } from '@/contexts/AuthProvider'
import { PendingActionsProvider } from '@/contexts/PendingActionsContext'

import {
  type IMockedApolloProviderProps,
  type IMockedResponse,
  MockedApolloProvider,
} from '../mocks/apollo'
import { createMockSession } from '../mocks/auth'

import type { Session } from 'next-auth'

/**
 * Test Utilities
 * Custom render function with providers (Apollo, Auth, Theme)
 */

export type AuthContextValue = {
  permissions: string[]
  modules: string[]
  tenant: { id: string; name: string; logoUrl: string; modules: string[] }
  switchedTenant: { id: string; name: string; logoUrl: string; modules: string[] } | null
  currentTenant: { id: string; name: string; logoUrl: string; modules: string[] } | null
  loading: boolean
  error?: Error
  hasSwitchedTenant: boolean
}

const DEFAULT_AUTH_VALUE: AuthContextValue = {
  permissions: [
    'micro-erp::appointments::appointments::view',
    'micro-erp::appointments::appointments::create',
    'micro-erp::appointments::appointments::edit',
    'micro-erp::appointments::appointments::delete',
    'micro-erp::appointments::patients::view',
    'micro-erp::appointments::patients::create',
    'micro-erp::appointments::patients::edit',
    'micro-erp::appointments::patients::delete',
    'micro-erp::appointments::professionals::view',
    'micro-erp::appointments::professionals::create',
    'micro-erp::appointments::professionals::edit',
    'micro-erp::appointments::professionals::delete',
    'micro-erp::appointments::offices::view',
    'micro-erp::appointments::offices::create',
    'micro-erp::appointments::offices::edit',
    'micro-erp::appointments::offices::delete',
    'micro-erp::appointments::provided_services::view',
    'micro-erp::appointments::provided_services::create',
    'micro-erp::appointments::provided_services::edit',
    'micro-erp::appointments::provided_services::delete',
    'micro-erp::appointments::analytics::appointments',
    'micro-erp::appointments::analytics::financial',
    'micro-erp::real-estate::properties::view',
    'micro-erp::settings::settings::view',
    'micro-erp::access-control::roles::view',
    'micro-erp::access-control::users::view',
  ],
  modules: ['appointments', 'real-estate', 'settings'],
  tenant: {
    id: 'test-tenant-id',
    name: 'Test Tenant',
    logoUrl: '',
    modules: ['appointments', 'real-estate', 'settings'],
  },
  switchedTenant: null,
  currentTenant: {
    id: 'test-tenant-id',
    name: 'Test Tenant',
    logoUrl: '',
    modules: ['appointments', 'real-estate', 'settings'],
  },
  loading: false,
  error: undefined,
  hasSwitchedTenant: false,
}

export function MockAuthProvider({
  children,
  value,
}: {
  children: ReactNode
  value?: Partial<AuthContextValue>
}) {
  const mergedValue: AuthContextValue = { ...DEFAULT_AUTH_VALUE, ...value }

  return <AuthContext.Provider value={mergedValue}>{children}</AuthContext.Provider>
}

export interface ICustomRenderOptions extends RenderOptions {
  apolloMocks?: IMockedResponse[]
  session?: Session | null
  apolloProviderProps?: Partial<IMockedApolloProviderProps>
  includeDefaultPermissions?: boolean
  useMockAuth?: boolean
  authValue?: Partial<AuthContextValue>
}

function AllTheProviders({
  children,
  apolloMocks = [],
  session = createMockSession(),
  apolloProviderProps,
  includeDefaultPermissions = true,
  useMockAuth = true,
  authValue,
}: ICustomRenderOptions & { children: ReactNode }) {
  return (
    <SessionProvider session={session}>
      <MockedApolloProvider mocks={apolloMocks} {...apolloProviderProps}>
        <ThemeProvider>
          <React.Suspense fallback={<div data-testid="suspense-loading">Loading...</div>}>
            <PendingActionsProvider>
              {useMockAuth ? (
                <MockAuthProvider value={authValue}>{children}</MockAuthProvider>
              ) : includeDefaultPermissions ? (
                <PermissionsProvider>{children}</PermissionsProvider>
              ) : (
                children
              )}
            </PendingActionsProvider>
          </React.Suspense>
        </ThemeProvider>
      </MockedApolloProvider>
    </SessionProvider>
  )
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    apolloMocks,
    session,
    apolloProviderProps,
    includeDefaultPermissions,
    useMockAuth,
    authValue,
    wrapper: CustomWrapper,
    ...renderOptions
  }: ICustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        apolloMocks={apolloMocks}
        session={session}
        apolloProviderProps={apolloProviderProps}
        includeDefaultPermissions={includeDefaultPermissions}
        useMockAuth={useMockAuth}
        authValue={authValue}
      >
        {CustomWrapper ? <CustomWrapper>{children}</CustomWrapper> : children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

/**
 * Custom renderHook function that wraps hooks with necessary providers
 */
export function renderHookWithProviders<TProps, TResult>(
  renderCallback: (props: TProps) => TResult,
  {
    apolloMocks = [],
    session = createMockSession(),
    apolloProviderProps,
    includeDefaultPermissions = true,
    useMockAuth = true,
    authValue,
    wrapper: CustomWrapper,
    ...renderOptions
  }: ICustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AllTheProviders
        apolloMocks={apolloMocks}
        session={session}
        apolloProviderProps={apolloProviderProps}
        includeDefaultPermissions={includeDefaultPermissions}
        useMockAuth={useMockAuth}
        authValue={authValue}
      >
        {CustomWrapper ? <CustomWrapper>{children}</CustomWrapper> : children}
      </AllTheProviders>
    )
  }

  return renderHook(renderCallback, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from RTL
export * from '@testing-library/react'
