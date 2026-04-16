import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RequestsTable } from "./RequestsTable";
import { useFragment } from "@/__generated__";
import { useRouter, useSearchParams } from "next/navigation";

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
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useParams: vi.fn(() => ({ locale: "en" })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(),
    toString: () => "",
  })),
  usePathname: vi.fn(() => "/en/requests/me"),
}));
// Mock CancelRequestModal to avoid Apollo dependency
vi.mock("@/components/requests/CancelRequestModal", () => ({
  CancelRequestModal: () => <div data-testid="cancel-modal" />,
}));

// Mock RequestStatusBadge
vi.mock("./RequestStatusBadge", () => ({
  RequestStatusBadge: () => <div data-testid="status-badge" />,
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
  });

  it("renders empty state when no requests are found", () => {
    (useFragment as any).mockReturnValue({ nodes: [] });

    render(<RequestsTable requestsRef={{} as any} />);

    expect(screen.getByText("emptyStateTitle")).toBeInTheDocument();
    expect(screen.queryByTestId("paginated-table")).not.toBeInTheDocument();
  });

  it("renders filter badge and clear button when status is filtered", () => {
    (useFragment as any).mockReturnValue(mockRequests);
    const mockSearchParams = {
      get: vi.fn().mockReturnValue("pending"),
      toString: () => "status=pending",
    };
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<RequestsTable requestsRef={{} as any} />);

    // Mocked status badge should appear (RequestStatus.PENDING)
    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
    expect(screen.getByText("clearFilters")).toBeInTheDocument();
  });

  it("calls router.push when clear filters is clicked", () => {
    const pushMock = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);
    const mockSearchParams = {
      get: vi.fn().mockReturnValue("pending"),
      toString: () => "status=pending",
    };
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    render(<RequestsTable requestsRef={{} as any} />);

    const clearButton = screen.getByText("clearFilters").parentElement!;
    const { fireEvent } = require("@testing-library/react");
    fireEvent.click(clearButton);

    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("?"));
  });
});
