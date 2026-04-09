import { Printer } from 'lucide-react'
import React, { PropsWithChildren, ComponentProps } from 'react'
import { useReactToPrint } from 'react-to-print'

import { Button } from '@/components/ui/button'

interface PrintButtonProps extends ComponentProps<typeof Button> {
  contentRef: React.RefObject<HTMLDivElement | null>
  documentTitle?: string
  onAfterPrint?: () => void
  onBeforePrint?: () => Promise<void>
  onPrintError?: (errorLocation: string, error: Error) => void
  bodyClass?: string
}

type Props = PropsWithChildren<PrintButtonProps>

export const PrintButton: React.FC<Props> = ({
  contentRef,
  documentTitle,
  onAfterPrint,
  onBeforePrint,
  onPrintError,
  bodyClass = 'print-body',
  children,
  ...buttonProps
}) => {
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle,
    onAfterPrint,
    onBeforePrint,
    onPrintError,
    bodyClass,
  })

  return (
    <Button onClick={() => handlePrint()} {...buttonProps}>
      <Printer />
      {children}
    </Button>
  )
}
