'use client'

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { LoadingSkeleton } from '@/components/card/LoadingCard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface IDataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue> & { align?: 'left' | 'right' | 'center' }>
  data: TData[] | null | undefined
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  emptyMessage,
  className,
}: IDataTableProps<TData, TValue>) {
  const tTable = useTranslations('table')
  const tLoading = useTranslations('loading')
  const defaultEmptyMessage = emptyMessage ?? tTable('noDataAvailable')

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const rowModel = table.getRowModel()

  if (loading) {
    return <LoadingSkeleton description={tLoading('pleaseWait')} />
  }

  if (!data || data.length === 0) {
    return <p className='text-center text-muted-foreground'>{defaultEmptyMessage}</p>
  }

  return (
    <div className={className ?? 'overflow-hidden rounded-md border p-6'}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className='bg-muted/50'>
              {headerGroup.headers.map(header => {
                const columnDef = columns.find(c => c.id === header.column.id)

                return (
                  <TableHead
                    key={header.id}
                    className={columnDef?.align === 'right' ? 'text-right' : ''}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rowModel.rows?.length ? (
            rowModel.rows.map(row => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                {tTable('noResults')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
