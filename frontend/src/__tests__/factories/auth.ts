import type { User as NextAuthUser, Session } from 'next-auth'

/**
 * Auth Mock Factory
 * Creates mock next-auth session and user objects
 */

export function createMockUser(overrides?: Partial<NextAuthUser & { accessToken: string; fullName: string }>): NextAuthUser & {
  accessToken: string
  fullName: string
} {
  return {
    id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test User',
    fullName: 'Test User',
    accessToken: 'mock-access-token',
    ...overrides,
  } as any
}

export function createMockSession(overrides?: Partial<Session>): Session {
  const user = createMockUser()

  return {
    user,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    accessToken: user.accessToken,
    ...overrides,
  } as any
}

export function createMockUnauthenticatedSession(): null {
  return null
}
