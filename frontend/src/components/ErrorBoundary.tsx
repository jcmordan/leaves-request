/* eslint-disable no-console */

'use client'

import { useSession } from 'next-auth/react'
import { ErrorInfo } from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const ErrorFallback = ({ error }: ErrorFallbackProps) => {
  const sessionData = useSession()
  const isAuthenticated = sessionData.status === 'authenticated' && !!sessionData.data

  // Smart error detection
  const isNetworkError =
    error.message.includes('Network request failed') ||
    error.message.includes('fetch') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError')

  const isAuthError =
    error.message.includes('not authorized') ||
    error.message.includes('unauthorized') ||
    error.message.includes('authentication') ||
    error.message.includes('Unauthorized') ||
    error.message.includes('401') ||
    error.message.includes('SessionProvider')

  const isGraphQLError =
    error.message.includes('GraphQL') ||
    error.message.includes('syntax') ||
    error.message.includes('query') ||
    error.message.includes('mutation')

  const getErrorTitle = () => {
    if (isNetworkError) {
      return 'Connection Error'
    }
    if (isAuthError) {
      return 'Authentication Error'
    }
    if (isGraphQLError) {
      return 'Data Loading Error'
    }

    return 'Something went wrong'
  }

  const getErrorMessage = () => {
    if (isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    }

    if (isAuthError) {
      if (isAuthenticated) {
        return "You don't have permission to access this data. Please contact your administrator."
      }

      return 'You need to be signed in to access this data. Please sign in and try again.'
    }

    if (isGraphQLError) {
      return 'There was an issue loading the data. Please try again or contact support if the problem persists.'
    }

    return 'An unexpected error occurred. Please try again or contact support if the problem persists.'
  }

  return (
    <Card className='p-6'>
      <CardHeader>
        <CardTitle>{getErrorTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <p className='text-gray-600'>{getErrorMessage()}</p>

          {process.env.NODE_ENV === 'development' && (
            <details className='bg-gray-50 p-4 rounded-lg'>
              <summary className='cursor-pointer font-medium text-gray-700 mb-2'>
                Error Details (Development)
              </summary>
              <pre className='text-sm text-red-600 overflow-auto'>
                {error.message}
                {'\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
}

export const ErrorBoundary = ({
  children,
  fallback = ErrorFallback,
  onError,
  onReset,
}: ErrorBoundaryProps) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error)
      console.error('Component stack:', errorInfo.componentStack)
    }

    // Call custom error handler if provided
    onError?.(error, errorInfo)
  }

  const handleReset = () => {
    // Call custom reset handler if provided
    onReset?.()
  }

  return (
    <ReactErrorBoundary FallbackComponent={fallback} onError={handleError} onReset={handleReset}>
      {children}
    </ReactErrorBoundary>
  )
}

export default ErrorBoundary
