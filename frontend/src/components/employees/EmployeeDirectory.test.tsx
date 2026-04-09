import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EmployeeDirectory } from './EmployeeDirectory'

const useSearchParamsMock = vi.fn()
const useSuspenseQueryMock = vi.fn()
const setFilterMock = vi.fn()
const directoryControlsProps: { onSearch?: (value: string) => void } = {}
const employeeTableProps: { onClearSearch?: () => void } = {}

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => useSearchParamsMock(),
}))

vi.mock('@apollo/client/react', () => ({
  useSuspenseQuery: (...args: unknown[]) => useSuspenseQueryMock(...args),
}))

vi.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: (value: string) => void) => fn,
}))

vi.mock('@/hooks/useUrlPagination', () => ({
  useUrlPagination: () => ({ setFilter: setFilterMock }),
}))

vi.mock('./StatsSection', () => ({
  StatsSection: () => <div data-testid="stats-section" />,
}))

vi.mock('./DirectoryControls', () => ({
  DirectoryControls: ({ onSearch }: { onSearch: (value: string) => void }) => {
    directoryControlsProps.onSearch = onSearch
    return (
      <button type="button" data-testid="trigger-search" onClick={() => onSearch('john')}>
        search
      </button>
    )
  },
}))

vi.mock('./EmployeeTable', () => ({
  EmployeeTable: ({ onClearSearch }: { onClearSearch: () => void }) => {
    employeeTableProps.onClearSearch = onClearSearch
    return (
      <button type="button" data-testid="clear-search" onClick={onClearSearch}>
        clear
      </button>
    )
  },
}))

describe('EmployeeDirectory', () => {
  it('builds variables with "before" branch and propagates search actions', () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => ({ before: 'cursor-prev', search: 'ana' }[key] ?? null),
    })

    useSuspenseQueryMock.mockReturnValue({
      data: { employees: { edges: [] }, employeeStats: {} },
    })

    render(<EmployeeDirectory />)

    expect(useSuspenseQueryMock).toHaveBeenCalledWith(expect.anything(), {
      variables: { last: 10, before: 'cursor-prev', search: 'ana' },
    })

    fireEvent.click(screen.getByTestId('trigger-search'))
    expect(setFilterMock).toHaveBeenCalledWith('search', 'john')

    fireEvent.click(screen.getByTestId('clear-search'))
    expect(setFilterMock).toHaveBeenCalledWith('search', '')
  })

  it('builds variables with "after" branch when "before" is missing', () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => ({ after: 'cursor-next' }[key] ?? null),
    })

    useSuspenseQueryMock.mockReturnValue({
      data: { employees: { edges: [] }, employeeStats: {} },
    })

    render(<EmployeeDirectory />)

    expect(useSuspenseQueryMock).toHaveBeenCalledWith(expect.anything(), {
      variables: { first: 10, after: 'cursor-next', search: undefined },
    })
  })
})
