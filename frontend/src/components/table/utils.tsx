import { IconChevronsUpRight } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

import { ColumnDef } from './simple-table/SimpleTable'

export const createActionTableColumn = <T extends { id: string }>(
  handleRowClick: (data: T) => void
): ColumnDef<T> => {
  const column: ColumnDef<T> = {
    field: 'id',
    title: '',
    width: 20,
    render: item => {
      return (
        <Button
          variant='ghost'
          size='icon'
          aria-label='Ver detalle'
          onClick={() => handleRowClick(item)}
        >
          <IconChevronsUpRight className='h-4 w-4' />
        </Button>
      )
    },
  }

  return column
}
