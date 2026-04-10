import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

let capturedCallback: ((...args: any[]) => void) | null = null

vi.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: (...args: any[]) => void) => {
    capturedCallback = fn
    return (...args: any[]) => {
      // Execute synchronously for testing (simulates debounce firing immediately)
      fn(...args)
      return Promise.resolve()
    }
  },
}))

import { useDebouncedAsyncValidation } from './useDebouncedAsyncValidation'

describe('useDebouncedAsyncValidation', () => {
  beforeEach(() => {
    capturedCallback = null
  })

  it('returns a function', () => {
    const impl = vi.fn().mockResolvedValue(true)
    const { result } = renderHook(() => useDebouncedAsyncValidation(impl, 300))
    expect(result.current).toBeInstanceOf(Function)
  })

  it('resolves with validation result when impl returns true', async () => {
    const impl = vi.fn().mockResolvedValue(true)
    const { result } = renderHook(() => useDebouncedAsyncValidation(impl, 300))

    let validationResult: boolean | string | undefined
    await act(async () => {
      validationResult = await result.current('test-value')
    })

    expect(validationResult).toBe(true)
    expect(impl).toHaveBeenCalledWith('test-value')
  })

  it('resolves with error message when impl returns a string', async () => {
    const impl = vi.fn().mockResolvedValue('Field is required')
    const { result } = renderHook(() => useDebouncedAsyncValidation(impl, 300))

    let validationResult: boolean | string | undefined
    await act(async () => {
      validationResult = await result.current('bad-value')
    })

    expect(validationResult).toBe('Field is required')
  })

  it('cancels previous pending validation by resolving it as true', async () => {
    let resolveFirst: ((val: boolean | string) => void) | null = null
    let callCount = 0

    const impl = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return new Promise<boolean | string>(resolve => {
          resolveFirst = resolve
        })
      }
      return Promise.resolve('second result')
    })

    // Use a manual debounce mock to control timing
    const debouncedCalls: Array<(...args: any[]) => void> = []
    vi.doMock('use-debounce', () => ({
      useDebouncedCallback: (fn: (...args: any[]) => void) => {
        return (...args: any[]) => {
          debouncedCalls.push(() => fn(...args))
          return Promise.resolve()
        }
      },
    }))

    // For this test, use the synchronous mock - the key behavior is that
    // calling the validator a second time resolves the first call as `true`
    const { result } = renderHook(() => useDebouncedAsyncValidation(impl, 300))

    const results: Array<boolean | string> = []

    await act(async () => {
      // First call
      const p1 = result.current('first')
      // Second call - should cancel first by resolving it as true
      const p2 = result.current('second')

      // Since our mock executes synchronously, both will resolve
      results.push(await p1, await p2)
    })

    // First call gets resolved as true (cancelled), second gets actual result
    expect(results[0]).toBe(true)
  })

  it('passes arguments to the implementation', async () => {
    const impl = vi.fn().mockResolvedValue(true)
    const { result } = renderHook(() => useDebouncedAsyncValidation(impl, 500))

    await act(async () => {
      await result.current('arg1', 'arg2')
    })

    expect(impl).toHaveBeenCalledWith('arg1', 'arg2')
  })
})
