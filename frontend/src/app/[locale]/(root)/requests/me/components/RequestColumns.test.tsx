import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRequestColumns } from "./RequestColumns";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    key === "approved" ? "status_approved" : key,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({
    locale: "en",
  }),
}));

// Mock @/__generated__
vi.mock("@/__generated__", () => ({
  graphql: (s: string) => s,
  useFragment: (fragment: any, data: any) => data,
  RequestStatus: {
    Approved: "APPROVED",
    Pending: "PENDING",
    Rejected: "REJECTED",
    Cancelled: "CANCELLED",
  },
}));

// Mock @/i18n/navigation
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock CancelRequestModal
vi.mock("@/components/requests/CancelRequestModal", () => ({
  CancelRequestModal: () => <div data-testid="cancel-modal" />,
}));

// Helper to render a hook in a test component
const TestComponent = ({
  type,
  showAllCells,
}: {
  type: string;
  showAllCells?: boolean;
}) => {
  const columns = useRequestColumns();
  const mockRow = {
    original: {
      id: "1",
      createdAt: "2024-05-01T12:00:00Z",
      startDate: "2024-05-01T12:00:00Z",
      endDate: "2024-05-05T12:00:00Z",
      status: type,
      absenceType: { name: "Vacation" },
      employee: { fullName: "John Doe" },
    },
  };

  const renderCell = (id: string) => {
    const col = columns.find((c: any) => c.accessorKey === id || c.id === id);
    if (col && typeof col.cell === "function") {
      return col.cell({ row: mockRow, getValue: () => {} } as any);
    }
    return null;
  };

  return (
    <div>
      <div data-testid="status-cell">{renderCell("status")}</div>
      <div data-testid="type-cell">{renderCell("absenceType.name")}</div>
      <div data-testid="period-cell">{renderCell("period")}</div>
      {showAllCells && (
        <>
          <div data-testid="submitted-cell">{renderCell("createdAt")}</div>
          <div data-testid="employee-cell">
            {renderCell("employee.fullName")}
          </div>
          <div data-testid="days-cell">{renderCell("days")}</div>
          <div data-testid="actions-cell">{renderCell("actions")}</div>
        </>
      )}
    </div>
  );
};

describe("RequestColumns", () => {
  it("returns the correct number of columns", () => {
    const columns = useRequestColumns();
    expect(columns).toHaveLength(7);
  });

  it("renders status badges correctly", () => {
    render(<TestComponent type="APPROVED" />);
    expect(screen.getByText("status_approved")).toBeInTheDocument();
  });

  it("renders absence type correctly", () => {
    render(<TestComponent type="APPROVED" />);
    expect(screen.getByText("Vacation")).toBeInTheDocument();
  });

  it("renders period correctly", () => {
    render(<TestComponent type="APPROVED" />);
    expect(screen.getByTestId("period-cell")).toHaveTextContent("May 1");
  });

  it("renders pending status", () => {
    render(<TestComponent type="PENDING" />);
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("renders rejected status", () => {
    render(<TestComponent type="REJECTED" />);
    expect(screen.getByText("rejected")).toBeInTheDocument();
  });

  it("renders cancelled status", () => {
    render(<TestComponent type="CANCELLED" />);
    expect(screen.getByText("cancelled")).toBeInTheDocument();
  });

  it("renders default badge for unknown status", () => {
    render(<TestComponent type="UNKNOWN_STATUS" />);
    expect(screen.getByText("UNKNOWN_STATUS")).toBeInTheDocument();
  });

  it("renders submitted cell with formatted date", () => {
    render(<TestComponent type="APPROVED" showAllCells />);
    expect(screen.getByTestId("submitted-cell")).toHaveTextContent(
      "May 1, 2024",
    );
  });

  it("renders employee cell", () => {
    render(<TestComponent type="APPROVED" showAllCells />);
    expect(screen.getByTestId("employee-cell")).toHaveTextContent("John Doe");
  });

  it("renders days cell", () => {
    render(<TestComponent type="APPROVED" showAllCells />);
    expect(screen.getByTestId("days-cell")).toHaveTextContent(/\d+/);
  });

  it("renders actions cell with cancel button for pending requests", () => {
    render(<TestComponent type="PENDING" showAllCells />);
    const actionsCell = screen.getByTestId("actions-cell");
    const buttons = actionsCell.querySelectorAll("button");
    expect(buttons.length).toBe(2);
  });

  it("renders actions cell without cancel button for approved requests", () => {
    render(<TestComponent type="APPROVED" showAllCells />);
    const actionsCell = screen.getByTestId("actions-cell");
    const buttons = actionsCell.querySelectorAll("button");
    expect(buttons.length).toBe(1);
  });
});
