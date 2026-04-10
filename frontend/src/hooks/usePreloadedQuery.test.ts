import { describe, expect, it, vi } from 'vitest'

vi.mock('@apollo/client/react', () => ({
  useSuspenseQuery: vi.fn(),
}))

import { useSuspenseQuery } from '@apollo/client/react'
import { usePreloadedQuery } from './usePreloadedQuery'

describe('usePreloadedQuery', () => {
  it('is an alias for useSuspenseQuery', () => {
    expect(usePreloadedQuery).toBe(useSuspenseQuery)
  })
})
