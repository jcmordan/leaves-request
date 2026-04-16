import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { EmployeeEditSheet } from "./EmployeeEditSheet";
import { Sheet } from "@/components/ui/sheet";
import { MockedProvider } from "@apollo/client/testing/react";
import {
  EMPLOYEE_FOR_EDIT_QUERY,
  UPDATE_EMPLOYEE_MUTATION,
  JOB_TITLES_SEARCH_QUERY,
  COMPANIES_SEARCH_QUERY,
  DEPARTMENTS_SEARCH_QUERY,
  DEPARTMENT_SECTIONS_SEARCH_QUERY,
  EMPLOYEES_SEARCH_QUERY,
} from "../graphql/EmployeeQueries";

// Mocking next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mocking next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ employee_id: "test-id" }),
}));

// Mocking useSheets
const closeSheetMock = vi.fn();
const setOptionsMock = vi.fn();
vi.mock("@/components/layout/sheets/SheetNavigation", () => ({
  useSheets: () => ({
    sheetOptions: { id: "test-id" },
    closeSheet: closeSheetMock,
    setOptions: setOptionsMock,
  }),
}));

// Mocking @/__generated__
vi.mock("@/__generated__", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useFragment: vi.fn((_fragment, data) => data),
  };
});

const mocks = [
  {
    request: {
      query: EMPLOYEE_FOR_EDIT_QUERY,
      variables: { id: "test-id" },
    },
    result: {
      data: {
        employee: {
          __typename: "Employee",
          id: "test-id",
          fullName: "John Doe",
          email: "john@example.com",
          employeeCode: "EMP001",
          an8: "12345",
          nationalId: "ID-123",
          hireDate: "2020-01-01T00:00:00Z",
          isActive: true,
          jobTitle: { __typename: "JobTitle", id: "jt-1", name: "Developer" },
          department: {
            __typename: "Department",
            id: "d-1",
            name: "Engineering",
          },
          departmentSection: {
            __typename: "DepartmentSection",
            id: "s-1",
            name: "Frontend",
          },
          company: { __typename: "Company", id: "c-1", name: "Sovereign" },
          manager: { __typename: "Employee", id: "m-1", fullName: "Bossman" },
        },
      },
    },
  },
  // Silent mocks for autocomplete queries to avoid "No more mocked responses" noise
  {
    request: {
      query: JOB_TITLES_SEARCH_QUERY,
      variables: { search: null, first: 20 },
    },
    result: {
      data: {
        jobTitles: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    },
  },
  {
    request: {
      query: COMPANIES_SEARCH_QUERY,
      variables: { search: null, first: 20 },
    },
    result: {
      data: {
        companies: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    },
  },
  {
    request: {
      query: DEPARTMENTS_SEARCH_QUERY,
      variables: { search: null, first: 20 },
    },
    result: {
      data: {
        departments: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    },
  },
  {
    request: {
      query: EMPLOYEES_SEARCH_QUERY,
      variables: { search: "", first: 20 },
    },
    result: {
      data: {
        employees: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    },
  },
  {
    request: {
      query: DEPARTMENT_SECTIONS_SEARCH_QUERY,
      variables: { search: null, first: 20, departmentId: "d-1" },
    },
    result: {
      data: {
        departmentSections: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    },
  },
];

describe("EmployeeEditSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setOptionsMock.mockReturnValue(undefined);
  });

  it("renders loading state initially", () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Sheet open={true}>
          <EmployeeEditSheet />
        </Sheet>
      </MockedProvider>,
    );

    expect(screen.getByText("pleaseWait")).toBeInTheDocument();
  });

  it("renders form with employee data", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Sheet open={true}>
          <EmployeeEditSheet />
        </Sheet>
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("EMP001")).toBeInTheDocument();
      expect(screen.getByText("Developer")).toBeInTheDocument();
      expect(screen.getByText("Engineering")).toBeInTheDocument();
    });
  });

  it("validates required fields", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Sheet open={true}>
          <EmployeeEditSheet />
        </Sheet>
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("John Doe");
    fireEvent.change(nameInput, { target: { value: "" } });

    // Trigger validation
    fireEvent.click(screen.getByText("save"));

    await waitFor(() => {
      expect(screen.getByLabelText(/fullName/i)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });
  });
});
