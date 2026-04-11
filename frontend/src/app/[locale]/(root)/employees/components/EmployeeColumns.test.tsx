import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useEmployeeColumns } from './EmployeeColumns'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('../../../../../components/ui/button', () => ({
  Button: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <div onClick={onClick}>{children}</div>
  ),
}))

vi.mock('@tabler/icons-react', () => ({
  IconChevronsUpRight: () => <span data-testid="action-icon" />,
  IconPencil: () => <span data-testid="edit-icon" />,
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/employees',
}))

vi.mock('@/components/layout/sheets/SheetNavigation', () => ({
  useSheets: () => ({ openSheet: vi.fn() }),
}))

vi.mock('@/utils/formatters', () => ({
  formatNationalId: (value: string) => `cedula:${value}`,
  getInitials: (value: string) => `initials:${value}`,
}))

describe('useEmployeeColumns', () => {
  const row = {
    original: {
      id: 'emp-1',
      employeeCode: 'E-001',
      nationalId: '00112345678',
      fullName: 'Ada Lovelace',
      jobTitle: { name: 'Engineer' },
      department: { name: 'Platform' },
    },
  }

  it('returns expected column metadata and renders key cells', () => {
    const columns = useEmployeeColumns()
    expect(columns).toHaveLength(5)

    const [nameCol, codeCol, idCol, departmentCol, actionsCol] = columns
    expect(nameCol.header).toBe('employee')
    expect(codeCol.header).toBe('employeeCode')
    expect(idCol.header).toBe('nationalId')
    expect(departmentCol.header).toBe('department')
    expect(actionsCol.id).toBe('actions')

    const NameCell = nameCol.cell as (props: { row: typeof row }) => JSX.Element
    render(<NameCell row={row} />)
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('Engineer')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/employees/emp-1')

    const NationalIdCell = idCol.cell as (props: { row: typeof row }) => JSX.Element
    render(<NationalIdCell row={row} />)
    expect(screen.getByText('cedula:00112345678')).toBeInTheDocument()

    const EmployeeCodeCell = codeCol.cell as (props: { row: typeof row }) => JSX.Element
    render(<EmployeeCodeCell row={row} />)
    expect(screen.getByText('E-001')).toBeInTheDocument()

    const ActionCell = actionsCol.cell as (props: { row: typeof row }) => JSX.Element
    render(<ActionCell row={row} />)
    expect(screen.getAllByTestId('action-icon').length).toBeGreaterThan(0)
  })

  it('uses fallback values for missing optional fields', () => {
    const columns = useEmployeeColumns()
    const rowWithMissingData = {
      original: {
        id: 'emp-2',
        employeeCode: 'E-002',
        nationalId: '00298765432',
        fullName: 'Alan',
        jobTitle: null,
        department: null,
      },
    }

    const NameCell = columns[0].cell as (props: { row: typeof rowWithMissingData }) => JSX.Element
    const DepartmentCell = columns[3].cell as (props: {
      row: typeof rowWithMissingData
    }) => JSX.Element

    render(<NameCell row={rowWithMissingData} />)
    expect(screen.getAllByText('-').length).toBeGreaterThan(0)

    render(<DepartmentCell row={rowWithMissingData} />)
    expect(screen.getAllByText('-').length).toBeGreaterThan(1)
  })
})
