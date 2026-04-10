import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { EmployeeEditSheet } from './EmployeeEditSheet'
import { MockedProvider } from '@apollo/client/testing'
import {
  EMPLOYEE_FOR_EDIT_QUERY,
  EMPLOYEE_EDIT_METADATA_FRAGMENT,
  UPDATE_EMPLOYEE_MUTATION,
} from "./EmployeeEditSheetQueries";

// Mocking next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mocking useSheets
const closeSheetMock = vi.fn()
vi.mock('@/components/layout/sheets/SheetNavigation', () => ({
  useSheets: () => ({
    sheetOptions: { id: 'test-id' },
    closeSheet: closeSheetMock,
  }),
}))

const mocks = [
  {
    request: {
      query: EMPLOYEE_FOR_EDIT_QUERY,
      variables: { id: "test-id" },
    },
    result: {
      data: {
        employee: {
          id: "test-id",
          fullName: "John Doe",
          email: "john@example.com",
          employeeCode: "EMP001",
          an8: "12345",
          nationalId: "ID-123",
          hireDate: "2020-01-01T00:00:00Z",
          isActive: true,
          jobTitle: { id: "jt-1", name: "Developer" },
          department: { id: "d-1", name: "Engineering" },
          departmentSection: { id: "s-1", name: "Frontend" },
          company: { id: "c-1", name: "Sovereign" },
          manager: { id: "m-1", fullName: "Bossman" },
        },
      },
    },
  },
  {
    request: {
      query: EMPLOYEE_EDIT_METADATA_FRAGMENT,
    },
    result: {
      data: {
        jobTitles: { edges: [{ node: { id: "jt-1", name: "Developer" } }] },
        departments: { edges: [{ node: { id: "d-1", name: "Engineering" } }] },
        companies: { edges: [{ node: { id: "c-1", name: "Sovereign" } }] },
        departmentSections: {
          edges: [
            { node: { id: "s-1", name: "Frontend", departmentId: "d-1" } },
          ],
        },
        employees: { edges: [{ node: { id: "m-1", fullName: "Bossman" } }] },
      },
    },
  },
];

describe('EmployeeEditSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <EmployeeEditSheet />
      </MockedProvider>
    )

    expect(screen.getByText('pleaseWait')).toBeInTheDocument()
  })

  it('renders form with employee data', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <EmployeeEditSheet />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('EMP001')).toBeInTheDocument()
    expect(screen.getByText('Developer')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <EmployeeEditSheet />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    const nameInput = screen.getByDisplayValue('John Doe')
    fireEvent.change(nameInput, { target: { value: '' } })
    
    // Trigger validation
    fireEvent.click(screen.getByText('save'))

    await waitFor(() => {
      expect(screen.getByText('Full Name is required')).toBeInTheDocument()
    })
  })
})
