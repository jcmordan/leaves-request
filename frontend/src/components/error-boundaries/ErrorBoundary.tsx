'use client'

import { isEmpty } from 'lodash'
import { Component, ErrorInfo, ReactNode } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

const log = logger.child({ module: 'error-boundary' })

interface IProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface IState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): IState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    log.error({ error, errorInfo }, 'Error boundary caught an error')

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className='flex items-center justify-center min-h-screen p-4'>
          <Alert variant='destructive' className='max-w-md'>
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className='mt-2'>
              {isEmpty(this.state.error?.message)
                ? 'An unexpected error occurred'
                : this.state.error?.message}
            </AlertDescription>
            <div className='mt-4'>
              <Button onClick={this.handleReset} variant='outline'>
                Try again
              </Button>
            </div>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
