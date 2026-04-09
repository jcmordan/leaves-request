import React, { useRef } from 'react'

import { PrintButton } from '@/components/buttons/PrintButton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface PrintReceiptDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: React.ReactNode
}

export const PrintReceiptDialog: React.FC<PrintReceiptDialogProps> = ({
  isOpen,
  onOpenChange,
  title = 'Print Receipt',
  children,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto z-50'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className='flex justify-end gap-2 mb-4'>
          <PrintButton contentRef={contentRef} variant='outline'>
            Print
          </PrintButton>
        </div>

        <div className='bg-gray-100 p-8 rounded-lg overflow-auto flex justify-center'>
          {/* Wrapper for print content */}
          <div className='bg-white shadow p-0 print:shadow-none print:m-0'>
            <div ref={contentRef}>{children}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
