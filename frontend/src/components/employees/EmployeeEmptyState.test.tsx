import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EmployeeEmptyState } from './EmployeeEmptyState'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('lucide-react', () => ({
  RotateCcw: () => <span />,
  Search: () => <span />,
  User: () => <span />,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: ReactNode
    onClick?: () => void
  }) => <button onClick={onClick}>{children}</button>,
}))

describe('EmployeeEmptyState', () => {
  it('renders clear action when callback is provided', () => {
    const onClearSearch = vi.fn()

    render(<EmployeeEmptyState onClearSearch={onClearSearch} />)

    const clearButton = screen.getByRole('button', { name: 'clearSearch' })
    fireEvent.click(clearButton)
    expect(onClearSearch).toHaveBeenCalledTimes(1)
  })

  it('does not render clear action without callback', () => {
    render(<EmployeeEmptyState />)
    expect(screen.queryByRole('button', { name: 'clearSearch' })).not.toBeInTheDocument()
  })
})
