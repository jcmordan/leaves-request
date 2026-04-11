'use client'

import * as SheetPrimitive from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { cva, type VariantProps } from 'class-variance-authority'
import { XIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { SheetPortalProvider } from '@/components/layout/sheets/SheetPortalContext'

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot='sheet' {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot='sheet-trigger' {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot='sheet-close' {...props} />
}

function SheetPortal({
  container,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal> & { container?: HTMLElement | null }) {
  return <SheetPrimitive.Portal container={container} data-slot='sheet-portal' {...props} />
}

function SheetOverlay({
  className,
  contained,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay> & { contained?: boolean }) {
  return (
    <SheetPrimitive.Overlay
      data-slot='sheet-overlay'
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 inset-0 bg-black/50',
        contained ? 'absolute' : 'fixed',
        className
      )}
      {...props}
    />
  )
}

const sheetVariants = cva(
  'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 border-t border-r transition-colors duration-200',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        right:
          'inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      },
      size: {
        default: '',
        sm: '',
        md: '',
        lg: '',
        xl: '',
        full: 'w-full',
        auto: '',
      },
    },
    compoundVariants: [
      {
        side: ['left', 'right'],
        size: 'default',
        className: 'w-3/4 sm:max-w-sm',
      },
      {
        side: ['left', 'right'],
        size: 'sm',
        className: 'w-[384px]',
      },
      {
        side: ['left', 'right'],
        size: 'md',
        className: 'w-[540px]',
      },
      {
        side: ['left', 'right'],
        size: 'lg',
        className: 'w-[800px]',
      },
      {
        side: ['left', 'right'],
        size: 'xl',
        className: 'w-[1000px]',
      },
    ],
    defaultVariants: {
      side: 'right',
      size: 'default',
    },
  }
)

interface SheetContentProps
  extends React.ComponentProps<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  container?: HTMLElement | null
  onContainerReady?: (container: HTMLDivElement | null) => void
}

function SheetContent({
  className,
  children,
  side,
  size,
  container,
  onContainerReady,
  ...props
}: SheetContentProps) {
  const [containerNode, setContainerNode] = React.useState<HTMLDivElement | null>(null)

  const contentRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setContainerNode(node)
      onContainerReady?.(node)
    },
    [onContainerReady]
  )

  const [isShaking, setIsShaking] = React.useState(false)

  const triggerShake = React.useCallback(() => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }, [])

  const isContained = !!container

  return (
    <>
      <SheetPortal container={container}>
        <SheetOverlay
          contained={isContained}
          className='bg-transparent fixed inset-0 cursor-default'
          onPointerDown={triggerShake}
        />
      </SheetPortal>
      <SheetPortal container={container}>
        <SheetPrimitive.Content
          ref={contentRef}
          data-slot='sheet-content'
          data-shaking={isShaking}
          className={cn(
            sheetVariants({ side, size }),
            isContained ? 'absolute' : 'fixed',
            isShaking && 'border-primary!',
            className
          )}
          onPointerDown={e => e.stopPropagation()}
          onPointerDownOutside={e => {
            e.preventDefault()
            triggerShake()
          }}
          {...props}
        >
          <div className={cn('flex flex-col h-full', isShaking && 'animate-shake-feedback')}>
            <VisuallyHidden.Root>
              <SheetPrimitive.Title>Sheet</SheetPrimitive.Title>
              <SheetPrimitive.Description>Sheet content</SheetPrimitive.Description>
            </VisuallyHidden.Root>
            <SheetPortalProvider container={containerNode}>{children}</SheetPortalProvider>
          </div>
          <SheetPrimitive.Close className='ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none'>
            <XIcon className='size-5' />
            <span className='sr-only'>Close</span>
          </SheetPrimitive.Close>
        </SheetPrimitive.Content>
      </SheetPortal>
    </>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-header'
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-footer'
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot='sheet-title'
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot='sheet-description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
