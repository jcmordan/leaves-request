'use client'

import React from 'react'

import DashboardCard from '@/components/card/DashboardCard'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type Props = {
  title: string
  tooltip?: string
  subtitle?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  value: React.ReactNode
}

const ReportSummaryCard = ({ title, tooltip, subtitle, action, icon, value }: Props) => {
  const titleContent = tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className='cursor-help underline-offset-4 decoration-dotted underline print:no-underline print:cursor-default'>
          {title}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  ) : (
    title
  )

  return (
    <DashboardCard
      className='print:flex-row-reverse print:items-center print:justify-between print:gap-4 print:py-2 print:px-6 print:h-auto print:flex-1 *:data-[slot=card-content]:print:p-0 *:data-[slot=card-content]:print:flex-none *:data-[slot=card-header]:print:flex-1 *:data-[slot=card-header]:print:px-0 print:min-w-fit'
      title={titleContent}
      subtitle={subtitle}
      action={action as any}
    >
      <div className='flex items-center justify-between'>
        <div className='text-3xl font-black mt-2 print:mt-0 print:text-2xl print:w-fit'>
          {value}
        </div>
        {icon && <div className='p-2 bg-slate-100 rounded-full print:hidden'>{icon}</div>}
      </div>
    </DashboardCard>
  )
}

export default ReportSummaryCard
