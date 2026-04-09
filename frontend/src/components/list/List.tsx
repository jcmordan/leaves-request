import { PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'

import { Button } from '../ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '../ui/item'

type ListProps = PropsWithChildren<{
  items: {
    title: string
    description: string
    actions?: {
      label: string
      onClick: () => void
    }[]
  }[]
  className?: string
}>

export const List = ({ items, className }: ListProps) => {
  return (
    <div className={cn('flex w-full max-w-md flex-col gap-0', className)}>
      {items.map((item, i) => (
        <Item key={i} variant='default'>
          <ItemContent className='gap-0'>
            <ItemTitle>{item.title}</ItemTitle>
            <ItemDescription>{item.description}</ItemDescription>
          </ItemContent>
          {item.actions && (
            <ItemActions>
              {item.actions.map((action, index) => (
                <Button key={index} variant='outline' size='sm'>
                  {action.label}
                </Button>
              ))}
            </ItemActions>
          )}
        </Item>
      ))}
    </div>
  )
}
