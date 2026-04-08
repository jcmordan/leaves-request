import type { IMockedResponse } from '../mocks/apollo'
import type { DocumentNode } from '@apollo/client'

/**
 * Apollo Client Mock Factory
 * Creates mock Apollo Client responses for queries and mutations
 */

export interface IMockQueryOptions<TData = unknown, TVariables = Record<string, unknown>> {
  query: DocumentNode
  variables?: TVariables
  data?: TData
  error?: Error
  delay?: number
}

export function createMockQueryResult<TData = unknown, TVariables = Record<string, unknown>>(
  options: IMockQueryOptions<TData, TVariables>
): IMockedResponse<TData> {
  const { query, variables, data, error, delay } = options

  if (error) {
    return {
      request: {
        query,
        variables: variables ?? {},
      },
      error,
      delay,
    }
  }

  return {
    request: {
      query,
      variables: variables ?? {},
    },
    result: {
      data: data ?? ({} as TData),
    },
    delay,
  }
}

export interface IMockMutationOptions<TData = unknown, TVariables = Record<string, unknown>> {
  mutation: DocumentNode
  variables?: TVariables
  data?: TData
  error?: Error
  delay?: number
}

export function createMockMutationResult<TData = unknown, TVariables = Record<string, unknown>>(
  options: IMockMutationOptions<TData, TVariables>
): IMockedResponse<TData> {
  const { mutation, variables, data, error, delay } = options

  if (error) {
    return {
      request: {
        query: mutation,
        variables: variables ?? {},
      },
      error,
      delay,
    }
  }

  return {
    request: {
      query: mutation,
      variables: variables ?? {},
    },
    result: {
      data: data ?? ({} as TData),
    },
    delay,
  }
}
