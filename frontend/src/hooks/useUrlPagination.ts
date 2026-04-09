'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export interface PageInfo {
  hasNextPage?: boolean | null
  hasPreviousPage?: boolean | null
  startCursor?: string | null
  endCursor?: string | null
}

export const useUrlPagination = (pageInfo?: PageInfo | null) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleNextPage = useCallback(() => {
    if (pageInfo?.hasNextPage && pageInfo.endCursor) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('after', pageInfo.endCursor)
      params.delete('before')
      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
    }
  }, [pageInfo, searchParams, pathname, router])

  const handlePreviousPage = useCallback(() => {
    if (pageInfo?.hasPreviousPage && pageInfo.startCursor) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('before', pageInfo.startCursor)
      params.delete('after')
      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
    }
  }, [pageInfo, searchParams, pathname, router])

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      // Reset cursors when filtering changes to prevent empty page states
      params.delete('after')
      params.delete('before')
      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
    },
    [searchParams, pathname, router]
  )

  const clearFilters = useCallback(
    (keys: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      keys.forEach(key => params.delete(key))
      params.delete('after')
      params.delete('before')
      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
    },
    [searchParams, pathname, router]
  )

  return {
    handleNextPage,
    handlePreviousPage,
    setFilter,
    clearFilters,
    hasNextPage: !!pageInfo?.hasNextPage,
    hasPreviousPage: !!pageInfo?.hasPreviousPage,
  }
}
