import { MockedProvider } from '@apollo/client/testing/react'
import React, { type ReactNode } from 'react'

import type { DocumentNode, InMemoryCache, ApolloLink, ApolloClient } from '@apollo/client'

// Define IMockedResponse type matching Apollo Client's MockedProvider expectations
// Reference: https://www.apollographql.com/docs/react/development-testing/testing/
export interface IMockedResponse<TData = unknown> {
  request: {
    query: DocumentNode
    variables?: Record<string, unknown>
  }
  result?: ApolloLink.Result<TData>
  error?: Error
  delay?: number
  newData?: () => ApolloLink.Result<TData>
}

/**
 * Apollo Client Mock Utilities
 * Provides utilities for mocking Apollo Client in tests
 *
 * Uses the official MockedProvider from @apollo/client/testing/react
 * Reference: https://www.apollographql.com/docs/react/development-testing/testing/
 */

/**
 * Creates a MockedProvider wrapper component for tests
 * This is a convenience wrapper around the official MockedProvider
 * Reference: https://www.apollographql.com/docs/react/development-testing/testing/
 */
export interface IMockedApolloProviderProps {
  children: ReactNode
  mocks?: IMockedResponse[]
  defaultOptions?: ApolloClient.DefaultOptions
  cache?: InMemoryCache
  showWarnings?: boolean
  addTypename?: boolean
}

export function MockedApolloProvider({
  children,
  mocks = [],
  defaultOptions,
  cache,
  showWarnings = false,
  addTypename = true,
}: any): React.ReactElement {
  return (
    <MockedProvider
      {...({
        mocks,
        defaultOptions,
        cache,
        showWarnings,
        addTypename,
      } as any)}
    >
      {children}
    </MockedProvider>
  )
}

/**
 * Helper to mock a GraphQL query
 */
export function mockGraphQLQuery<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(query: DocumentNode, data: TData, variables?: TVariables): IMockedResponse<TData> {
  return {
    request: {
      query,
      variables: variables as Record<string, unknown>,
    },
    result: {
      data: data as any,
    },
  }
}

/**
 * Helper to mock a GraphQL mutation
 */
export function mockGraphQLMutation<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(mutation: DocumentNode, data: TData, variables?: TVariables): IMockedResponse<TData> {
  return {
    request: {
      query: mutation,
      variables: variables as Record<string, unknown>,
    },
    result: {
      data: data as any,
    },
  }
}

/**
 * Helper to create a mocked query result
 */
export function createMockedQueryResult<TData = unknown>(
  data: TData
): { data: TData; loading: false; error: undefined } {
  return {
    data,
    loading: false,
    error: undefined,
  }
}

/**
 * Helper to create a mocked mutation result
 */
export const createMockedMutationResult = createMockedQueryResult

/**
 * Helper to create a mocked loading state
 */
export function createMockedLoadingState(): {
  data: undefined
  loading: true
  error: undefined
} {
  return {
    data: undefined,
    loading: true,
    error: undefined,
  }
}

/**
 * Helper to create a mocked error state
 */
export function createMockedErrorState(error: Error): {
  data: undefined
  loading: false
  error: Error
} {
  return {
    data: undefined,
    loading: false,
    error,
  }
}
