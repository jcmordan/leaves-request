import { SessionProvider } from 'next-auth/react'
import React, { type ReactNode } from 'react'

/**
 * next-auth Mock Utilities
 * Provides utilities for mocking next-auth in tests
 */

/**
 * Creates a mock session object
 * Re-exported from factories for convenience
 */
export { createMockSession, createMockUnauthenticatedSession } from '../factories/auth'

/**
 * Mock setup for next-auth/react
 * Call this in your test setup or beforeEach
 */
export function mockNextAuth(session: ReturnType<typeof createMockSession> | null = null) {
  const mockUseSession = jest.fn(() => ({
    data: session,
    status: session ? 'authenticated' : 'unauthenticated',
    update: jest.fn(),
  }))

  const mockSignIn = jest.fn()
  const mockSignOut = jest.fn()

  jest.mock('next-auth/react', () => ({
    useSession: mockUseSession,
    signIn: mockSignIn,
    signOut: mockSignOut,
    SessionProvider: ({ children }: { children: ReactNode }) => children,
    getSession: jest.fn(() => Promise.resolve(session)),
  }))

  return {
    mockUseSession,
    mockSignIn,
    mockSignOut,
  }
}

/**
 * Mock setup for getServerSession (server-side)
 */
export function mockGetServerSession(session: ReturnType<typeof createMockSession> | null = null) {
  jest.mock('next-auth', () => ({
    getServerSession: jest.fn(() => Promise.resolve(session)),
    authOptions: {},
  }))
}

/**
 * Wrapper component for testing authenticated components
 */
export interface IWithAuthProps {
  children: ReactNode
  session?: ReturnType<typeof createMockSession> | null
}

export function WithAuth({ children, session = createMockSession() }: IWithAuthProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}

/**
 * Wrapper component for testing unauthenticated components
 */
export interface IWithoutAuthProps {
  children: ReactNode
}

export function WithoutAuth({ children }: IWithoutAuthProps) {
  return <SessionProvider session={null}>{children}</SessionProvider>
}
