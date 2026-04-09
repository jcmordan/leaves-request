import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { JSX } from 'react'

type Props = {
  className?: string
  children: JSX.Element | JSX.Element[]
}

const BlankCard = ({ children, className }: Props) => {
  return <Card className={cn('p-0 relative', className)}>{children}</Card>
}

export default BlankCard
