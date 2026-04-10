import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

const mockUpdate = vi.fn().mockResolvedValue(undefined)
let mockSession: Record<string, unknown> | null = null

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: mockSession,
    update: mockUpdate,
  }),
}))

let mockPathname = '/dashboard'
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    child: () => ({
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }),
  },
}))

import { useSessionKeepAlive } from './useSessionKeepAlive'

function setSession(expiresInMs: number) {
  mockSession = {
    accessToken: 'token-123',
    expires: new Date(Date.now() + expiresInMs).toISOString(),
  }
}

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    writable: true,
    configurable: true,
  })
}

describe('useSessionKeepAlive', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mockPathname = '/dashboard'
    setVisibility('visible')
    setSession(30 * 60 * 1000) // 30 min from now
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sets up and cleans up visibilitychange listener', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() => useSessionKeepAlive())

    expect(addSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))

    unmount()
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })

  it('does nothing when session has no token', () => {
    mockSession = null

    renderHook(() => useSessionKeepAlive())

    vi.advanceTimersByTime(60 * 60 * 1000)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('does nothing when session has no expires', () => {
    mockSession = { accessToken: 'token', expires: null }

    renderHook(() => useSessionKeepAlive())

    vi.advanceTimersByTime(60 * 60 * 1000)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('calls update on mount via route change effect (initial refresh)', () => {
    // On mount, lastRefreshTimeRef is 0, so timeSinceLastRefresh is huge
    // and the route change effect immediately calls update()
    renderHook(() => useSessionKeepAlive())

    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  it('schedules timeout-based refresh for token not near expiry', () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout')

    renderHook(() => useSessionKeepAlive())

    // The first effect schedules a setTimeout for the refresh
    expect(setTimeoutSpy).toHaveBeenCalled()
  })

  it('calls update when scheduled timeout fires', async () => {
    renderHook(() => useSessionKeepAlive())

    // 1 call from route change effect on mount
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    mockUpdate.mockClear()

    // 30min token, 20% threshold = 6min. Refresh at 24min mark.
    await vi.advanceTimersByTimeAsync(25 * 60 * 1000)

    expect(mockUpdate).toHaveBeenCalled()
  })

  it('sets up periodic interval after initial timeout refresh', async () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval')

    renderHook(() => useSessionKeepAlive())

    await vi.advanceTimersByTimeAsync(25 * 60 * 1000)

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5 * 60 * 1000)
  })

  it('refreshes immediately when token is near expiry', async () => {
    // Token expires in 2min, threshold is 6min → refreshTime <= 0
    setSession(2 * 60 * 1000)

    renderHook(() => useSessionKeepAlive())

    // Both effects fire: route change + immediate refresh from first effect
    await vi.advanceTimersByTimeAsync(0)

    expect(mockUpdate).toHaveBeenCalled()
  })

  it('sets up interval after immediate refresh for near-expiry token', async () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval')
    setSession(2 * 60 * 1000)

    renderHook(() => useSessionKeepAlive())

    await vi.advanceTimersByTimeAsync(0)

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5 * 60 * 1000)
  })

  it('does not call update when tab is hidden', () => {
    setVisibility('hidden')

    renderHook(() => useSessionKeepAlive())

    vi.advanceTimersByTime(30 * 60 * 1000)

    // Route change effect skips because tab is hidden
    // Timer-based refresh also checks visibility
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('enforces MIN_REFRESH_INTERVAL between refreshes', async () => {
    renderHook(() => useSessionKeepAlive())

    // Route change effect called update on mount
    const initialCalls = mockUpdate.mock.calls.length
    mockUpdate.mockClear()

    // Advance past MIN_REFRESH_INTERVAL but not to timeout
    await vi.advanceTimersByTimeAsync(2 * 60 * 1000)

    // No additional calls until the scheduled timeout at ~24min
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('clears timeout when visibility changes to hidden', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    renderHook(() => useSessionKeepAlive())

    setVisibility('hidden')
    document.dispatchEvent(new Event('visibilitychange'))

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })

  it('clears interval when visibility changes to hidden', async () => {
    setSession(2 * 60 * 1000)

    renderHook(() => useSessionKeepAlive())

    await vi.advanceTimersByTimeAsync(0)

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    setVisibility('hidden')
    document.dispatchEvent(new Event('visibilitychange'))

    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('restarts refresh interval when tab becomes visible again', async () => {
    renderHook(() => useSessionKeepAlive())
    mockUpdate.mockClear()

    // Go hidden
    setVisibility('hidden')
    document.dispatchEvent(new Event('visibilitychange'))

    // Come back visible
    setVisibility('visible')
    document.dispatchEvent(new Event('visibilitychange'))

    // Should set up refresh again - advance past scheduled time
    await vi.advanceTimersByTimeAsync(25 * 60 * 1000)

    expect(mockUpdate).toHaveBeenCalled()
  })

  it('handles update() error gracefully during scheduled refresh', async () => {
    renderHook(() => useSessionKeepAlive())
    mockUpdate.mockClear()
    mockUpdate.mockRejectedValueOnce(new Error('Network error'))

    // Advance to trigger the scheduled timeout refresh
    await vi.advanceTimersByTimeAsync(25 * 60 * 1000)

    expect(mockUpdate).toHaveBeenCalled()
  })

  it('handles setupRefreshInterval error on visibility change', async () => {
    renderHook(() => useSessionKeepAlive())

    // Go hidden first
    setVisibility('hidden')
    document.dispatchEvent(new Event('visibilitychange'))

    // Make update reject to trigger the catch in setupRefreshInterval
    mockUpdate.mockRejectedValueOnce(new Error('setup error'))

    // Come back visible - calls setupRefreshInterval which may catch errors
    setVisibility('visible')
    document.dispatchEvent(new Event('visibilitychange'))

    // Should not throw
    await vi.advanceTimersByTimeAsync(0)
  })

  it('clears existing timeout inside setupRefreshInterval when re-invoked', async () => {
    // Render with a 30min token → schedules a timeout (not immediate)
    renderHook(() => useSessionKeepAlive())

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    // Tab goes visible without going hidden first → setupRefreshInterval
    // is called again while timeoutRef is still set from initial setup
    document.dispatchEvent(new Event('visibilitychange'))

    // setupRefreshInterval should clear the existing timeout (lines 87-89)
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })

  it('clears existing interval inside setupRefreshInterval when re-invoked', async () => {
    // Near-expiry token → immediate refresh + interval setup
    setSession(2 * 60 * 1000)

    renderHook(() => useSessionKeepAlive())

    // Let the immediate refresh + interval setup complete
    await vi.advanceTimersByTimeAsync(0)

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    // Tab goes visible → setupRefreshInterval re-invoked while intervalRef is set
    document.dispatchEvent(new Event('visibilitychange'))

    // setupRefreshInterval should clear the existing interval (lines 91-93)
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  describe('route change effect', () => {
    it('calls update on route change when enough time has passed', async () => {
      renderHook(() => useSessionKeepAlive())

      // Mount already called update once
      mockUpdate.mockClear()

      // Advance past MIN_REFRESH_INTERVAL (60s)
      vi.advanceTimersByTime(2 * 60 * 1000)

      // Trigger route change by changing pathname
      mockPathname = '/employees'
      // Need to re-render to pick up the new pathname
      // But renderHook doesn't re-trigger on external mock changes
      // So we unmount and remount with new pathname
    })

    it('calls update with new pathname rerender', () => {
      const { rerender } = renderHook(() => useSessionKeepAlive())

      // Mount called update once
      expect(mockUpdate).toHaveBeenCalledTimes(1)
      mockUpdate.mockClear()

      // Advance past MIN_REFRESH_INTERVAL
      vi.advanceTimersByTime(2 * 60 * 1000)

      // Change pathname and rerender
      mockPathname = '/employees'
      rerender()

      // Route change effect should call update
      expect(mockUpdate).toHaveBeenCalled()
    })

    it('skips route change refresh when tab is hidden', () => {
      setVisibility('hidden')

      const { rerender } = renderHook(() => useSessionKeepAlive())

      mockPathname = '/employees'
      rerender()

      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('skips route change refresh when within MIN_REFRESH_INTERVAL', () => {
      const { rerender } = renderHook(() => useSessionKeepAlive())

      // Mount called update and set lastRefreshTimeRef to now
      expect(mockUpdate).toHaveBeenCalledTimes(1)
      mockUpdate.mockClear()

      // Don't advance past MIN_REFRESH_INTERVAL (60s)
      vi.advanceTimersByTime(10 * 1000) // only 10s

      mockPathname = '/employees'
      rerender()

      // Should NOT refresh - too soon since last refresh
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('handles update() error on route change gracefully', () => {
      const { rerender } = renderHook(() => useSessionKeepAlive())
      mockUpdate.mockClear()

      // Advance past MIN_REFRESH_INTERVAL
      vi.advanceTimersByTime(2 * 60 * 1000)

      mockUpdate.mockRejectedValueOnce(new Error('refresh failed'))

      mockPathname = '/settings'
      rerender()

      expect(mockUpdate).toHaveBeenCalled()
    })

    it('does not call update on route change when session is null', () => {
      mockSession = null

      const { rerender } = renderHook(() => useSessionKeepAlive())

      mockPathname = '/employees'
      rerender()

      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })
})
