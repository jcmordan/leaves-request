import React, { PropsWithChildren } from 'react'

type CardInfoSectionProps = PropsWithChildren<{
  title?: string | React.ReactNode
  padding?: 'sm' | 'lg'
  className?: string
}>

export const CardInfoSection = ({
  children,
  title,
  padding: noPadding = 'lg',
  className,
}: CardInfoSectionProps) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {title && (
        <h6 className={`font-semibold ${noPadding === 'sm' ? 'pt-2 pb-4' : 'pt-6 pb-4'}`}>
          {title}
        </h6>
      )}
      {children}
    </div>
  )
}

type Props = {
  label: string
  value?: React.ReactNode
  fullWidth?: boolean
  className?: string
}

export const CardInfo = ({ label, value, fullWidth, className }: Props) => {
  return (
    <div className='flex flex-row justify-start gap-2'>
      <span className='flex-1 text-sm font-medium'>{label}</span>
      <span
        className={`text-sm text-muted-foreground ${fullWidth ? 'w-[90%]' : 'w-[60%]'} ${className}`}
      >
        {value}
      </span>
    </div>
  )
}
