'use client'

import { DocumentNode, TypedDocumentNode } from '@apollo/client'
import { useQuery, useApolloClient } from '@apollo/client/react'
import { useSession } from 'next-auth/react'
import { useState, useMemo, useEffect } from 'react'

interface PageInfo {
  hasNextPage?: boolean | null
  hasPreviousPage?: boolean | null
  startCursor?: string | null
  endCursor?: string | null
}

interface PaginationVariables {
  first?: number
  after?: string | null
  last?: number
  before?: string | null
}

interface UsePaginatedQueryOptions<TData> {
  pageSize?: number
  variables?: Record<string, any>
  fetchPolicy?: 'cache-first' | 'network-only' | 'cache-only' | 'no-cache' | 'standby'
  skip?: boolean
  initialData?: TData
  getPageInfo: (data: TData | undefined) => PageInfo | null | undefined
}

interface UsePaginatedQueryResult<TData> {
  data: TData | undefined
  loading: boolean
  error: any
  pageInfo: PageInfo | null | undefined
  nextPage: () => void
  previousPage: () => void
  refetch: () => void
}

/**
 * Hook for managing paginated GraphQL queries with cursor-based pagination
 *
 * @example
 * const { data, loading, pageInfo, nextPage, previousPage } = usePaginatedQuery(
 *   MyQueryDocument,
 *   {
 *     pageSize: 10,
 *     initialData: ssrData,
 *     getPageInfo: (data) => data?.items?.pageInfo,
 *   }
 * )
 */
export function usePaginatedQuery<TData = any, TVariables = any>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options: UsePaginatedQueryOptions<TData>
): UsePaginatedQueryResult<TData> {
  const {
    pageSize = 10,
    variables: baseVariables,
    initialData,
    getPageInfo,
    ...queryOptions
  } = options

  // Handle session internally
  const { data: session, status } = useSession()

  const [paginationVars, setPaginationVars] = useState<PaginationVariables>({
    first: pageSize,
  })

  const client = useApolloClient()

  // Prepare variables
  const variables = useMemo(
    () =>
      ({
        ...baseVariables,
        ...paginationVars,
      }) as TVariables & PaginationVariables,
    [baseVariables, paginationVars]
  )

  // Hydrate cache if initialData is provided (from SSR)
  useEffect(() => {
    if (!initialData) {
      return
    }

    // Only hydrate if we are on the first page (no 'after' or 'before' cursors)
    const isInitialPage = !paginationVars.after && !paginationVars.before

    if (isInitialPage) {
      const existingData = client.readQuery({ query, variables })

      // Only write if the cache is empty or doesn't have data for these variables
      if (!existingData) {
        client.writeQuery({
          query,
          data: initialData,
          variables,
        })
      }
    }
  }, [client, query, initialData, variables, paginationVars.after, paginationVars.before])

  const {
    data: queryData,
    loading,
    error,
    refetch,
  } = useQuery<TData, TVariables & PaginationVariables>(query, {
    ...queryOptions,
    fetchPolicy: queryOptions.fetchPolicy ?? 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    // Automatically skip if:
    // 1. Session is loading
    // 2. No access token available
    // 3. Custom skip condition
    skip: queryOptions.skip ?? (status === 'loading' || !session?.accessToken),
    variables,
  })

  // Return local data if available, fallback to initialData (only if on first page)
  const data = useMemo(() => {
    if (queryData) {
      return queryData
    }

    return undefined
  }, [queryData])

  const pageInfo = useMemo(() => getPageInfo(data), [data, getPageInfo])

  const nextPage = () => {
    if (pageInfo?.endCursor) {
      setPaginationVars({
        first: pageSize,
        after: pageInfo.endCursor,
        last: undefined,
        before: undefined,
      })
    }
  }

  const previousPage = () => {
    if (pageInfo?.startCursor) {
      setPaginationVars({
        last: pageSize,
        before: pageInfo.startCursor,
        first: undefined,
        after: undefined,
      })
    }
  }

  return {
    data,
    loading,
    error,
    pageInfo,
    nextPage,
    previousPage,
    refetch,
  }
}
