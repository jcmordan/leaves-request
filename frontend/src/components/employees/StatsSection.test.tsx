import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StatsSection } from './StatsSection'

const useFragmentMock = vi.fn()

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { value?: string }) =>
    values?.value ? `${key}:${values.value}` : key,
  useFormatter: () => ({
    number: (value: number) => `#${value}`,
  }),
}))

vi.mock('@/__generated__', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/__generated__')>()
  return {
    ...actual,
    useFragment: (...args: unknown[]) => useFragmentMock(...args),
  }
})

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: ReactNode }) => <h3>{children}</h3>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('lucide-react', () => ({
  Users: () => <span />,
  UserCheck: () => <span />,
  Plane: () => <span />,
  TrendingUp: () => <span />,
  UserX: () => <span />,
}))

describe('StatsSection', () => {
  it('renders all employee stat cards from fragment data', () => {
    useFragmentMock.mockReturnValue({
      employeeStats: {
        total: 100,
        active: 80,
        onLeave: 10,
        inactive: 10,
      },
    })

    render(<StatsSection statsQueryRef={{} as never} />)

    expect(screen.getByText('statsTotal')).toBeInTheDocument()
    expect(screen.getByText('statsActive')).toBeInTheDocument()
    expect(screen.getByText('statsOnLeave')).toBeInTheDocument()
    expect(screen.getByText('statsInactive')).toBeInTheDocument()

    expect(screen.getByText('#100')).toBeInTheDocument()
    expect(screen.getByText('#80')).toBeInTheDocument()
    expect(screen.getAllByText('#10')).toHaveLength(2)
  })
})
