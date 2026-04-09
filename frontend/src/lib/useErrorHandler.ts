/* eslint-disable no-console */

'use client'

import { useCallback } from 'react'

interface ErrorHandlerOptions {
  onError?: (error: Error) => void
  logToConsole?: boolean
  showUserMessage?: boolean
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    onError,
    logToConsole = process.env.NODE_ENV === 'development',
    showUserMessage = true,
  } = options

  const handleError = useCallback(
    (error: Error, context?: string) => {
      // Log to console in development
      if (logToConsole) {
        console.error(`Error${context ? ` in ${context}` : ''}:`, error)
        console.error('Stack trace:', error.stack)
      }

      // Call custom error handler if provided
      if (onError) {
        onError(error)
      }

      // Show user message if enabled
      if (showUserMessage) {
        // You can integrate with a toast notification system here
        // For now, we'll just log it
        console.log('User should see error message:', error.message)
      }
    },
    [onError, logToConsole, showUserMessage]
  )

  const handleAsyncError = useCallback(
    async <T>(asyncFn: () => Promise<T>, context?: string): Promise<T | null> => {
      try {
        return await asyncFn()
      } catch (error) {
        handleError(error instanceof Error ? error : new Error(String(error)), context)

        return null
      }
    },
    [handleError]
  )

  const wrapWithErrorHandler = useCallback(
    //
    <T extends unknown[], R>(fn: (...args: T) => R | Promise<R>, context?: string) => {
      return async (...args: T): Promise<R | null> => {
        try {
          const result = fn(...args)
          if (result instanceof Promise) {
            return await result
          }

          return result
        } catch (error) {
          handleError(error instanceof Error ? error : new Error(String(error)), context)

          return null
        }
      }
    },
    [handleError]
  )

  return {
    handleError,
    handleAsyncError,
    wrapWithErrorHandler,
  }
}

export default useErrorHandler
