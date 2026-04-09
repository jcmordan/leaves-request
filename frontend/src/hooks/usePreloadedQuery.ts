'use client'

import { useSuspenseQuery } from '@apollo/client/react'

/**
 * Hook to consume data preloaded via PreloadQuery in RSC
 * Currently an alias for useSuspenseQuery to provide a consistent naming convention
 */
export const usePreloadedQuery = useSuspenseQuery
