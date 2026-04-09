'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'

import { logger } from '@/lib/logger'

const log = logger.child({ module: 'session-keep-alive' })

const MIN_REFRESH_INTERVAL = 60 * 1000 // Minimum 1 minute between refreshes

export function useSessionKeepAlive() {
  const { data: session, update } = useSession()
  const pathname = usePathname()
  const lastRefreshTimeRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!session?.expires || !session?.accessToken) {
      return
    }

    // Only refresh when tab is active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Clear intervals when tab becomes inactive
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else if (document.visibilityState === 'visible') {
        // Restart interval when tab becomes active
        setupRefreshInterval().catch(error => {
          log.error({ error }, 'Failed to setup refresh interval')
        })
      }
    }

    const calculateRefreshTime = (): number => {
      const expires = new Date(session.expires as Date).getTime()
      const now = Date.now()
      const timeUntilExpiry = expires - now
      const tokenLifetime = 30 * 60 * 1000 // Assume 30 minutes default
      const refreshThreshold = tokenLifetime * 0.2 // Refresh at 80% (20% remaining)

      // If we're within 20% of expiration, refresh immediately
      if (timeUntilExpiry <= refreshThreshold) {
        return 0
      }

      // Otherwise, refresh when we reach 80% of token lifetime
      return timeUntilExpiry - refreshThreshold
    }

    const refreshSession = async () => {
      const now = Date.now()
      const timeSinceLastRefresh = now - lastRefreshTimeRef.current

      // Enforce minimum interval between refreshes
      if (timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
        return
      }

      // Only refresh if tab is visible
      if (document.visibilityState !== 'visible') {
        return
      }

      try {
        await update()

        lastRefreshTimeRef.current = now
      } catch (error) {
        // Silently handle errors - existing error handling will catch RefreshAccessTokenError
        log.error({ error }, 'Failed to refresh session')
      }
    }

    const setupRefreshInterval = async () => {
      // Clear existing intervals
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      const refreshTime = calculateRefreshTime()

      if (refreshTime <= 0) {
        // Refresh immediately if we're past the threshold
        await refreshSession()
        // Set up interval for next refresh (refresh every 5 minutes after initial refresh)
        intervalRef.current = setInterval(refreshSession, 5 * 60 * 1000)
      } else {
        // Refresh at the calculated time
        timeoutRef.current = setTimeout(async () => {
          await refreshSession()
          // After initial refresh, set up periodic refresh (every 5 minutes)
          intervalRef.current = setInterval(refreshSession, 5 * 60 * 1000)
        }, refreshTime)
      }
    }

    // Set up initial refresh interval
    setupRefreshInterval().catch(error => {
      log.error({ error }, 'Failed to setup refresh interval')
    })

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [session, update])

  // Refresh on route changes
  useEffect(() => {
    if (!session?.expires || !session?.accessToken) {
      return
    }

    // Only refresh if tab is visible and enough time has passed since last refresh
    if (document.visibilityState !== 'visible') {
      return
    }

    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current

    if (timeSinceLastRefresh >= MIN_REFRESH_INTERVAL) {
      update().catch(error => {
        // Silently handle errors
        log.error({ error }, 'Failed to refresh session on route change')
      })

      lastRefreshTimeRef.current = now
    }
  }, [pathname, session, update])
}
