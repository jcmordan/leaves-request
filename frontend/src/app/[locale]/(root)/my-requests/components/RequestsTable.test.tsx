import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RequestsTable } from "./RequestsTable";
import { useFragment } from "@/__generated__";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock @/__generated__
vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: string) => s,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useParams: () => ({ locale: "en" }),
  useSearchParams: () => ({
    get: vi.fn(),
    toString: () => "",
  }),
  usePathname: () => "/en/my-requests",
}));
// Mock CancelRequestModal to avoid Apollo dependency
vi.mock("./CancelRequestModal", () => ({
  CancelRequestModal: () => <div data-testid="cancel-modal" />,
}));

// Mock useRequestColumns
vi.mock("./RequestColumns", () => ({
  useRequestColumns: () => [],
}));

// Mock PaginatedDataTable
vi.mock("@/components/ui/paginated-data-table", () => ({
  PaginatedDataTable: ({ data }: any) => (
    <div data-testid="paginated-table">
      {data.map((row: any) => (
        <div key={row.id}>{row.requestNumber}</div>
      ))}
    </div>
  ),
}));

describe("RequestsTable", () => {
  const mockRequests = {
    nodes: [
      { id: "1", requestNumber: "REQ-1" },
      { id: "2", requestNumber: "REQ-2" },
    ],
  };

  it("renders the table with requests", () => {
    (useFragment as any).mockReturnValue(mockRequests);

    render(<RequestsTable requestsRef={{} as any} />);

    expect(screen.getByText("recentActivity")).toBeInTheDocument();
    expect(screen.getByTestId("paginated-table")).toBeInTheDocument();
    expect(screen.getByText("REQ-1")).toBeInTheDocument();
    expect(screen.getByText("REQ-2")).toBeInTheDocument();
  });
});
