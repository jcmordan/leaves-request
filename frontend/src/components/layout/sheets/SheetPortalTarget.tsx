'use client'

import { useEffect, useRef } from 'react'

import { useSheets } from './SheetNavigation'

interface SheetPortalTargetProps {
  className?: string
  children?: React.ReactNode
}

/**
 * A component that marks the area where sheets should be rendered.
 * It automatically registers its ref with the SheetProvider to ensure
 * robust containment and avoid overlapping headers/footers.
 */
export const SheetPortalTarget = ({ className, children }: SheetPortalTargetProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { registerContainer } = useSheets()

  useEffect(() => {
    if (containerRef.current) {
      registerContainer(containerRef.current)
    }

    return () => registerContainer(null)
  }, [registerContainer])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
