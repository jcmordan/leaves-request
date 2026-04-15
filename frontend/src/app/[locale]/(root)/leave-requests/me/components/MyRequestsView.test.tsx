import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MyRequestsView from "./MyRequestsView";
import { useSuspenseQuery } from "@apollo/client/react";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock @apollo/client/react
vi.mock("@apollo/client/react", () => ({
  useSuspenseQuery: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn(),
  })),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

// Mock @/__generated__
vi.mock("@/__generated__", () => ({
  graphql: (s: string) => s,
  useFragment: vi.fn(),
}));

// Mock child components
vi.mock("./LeaveBalanceSection", () => ({
  LeaveBalanceSection: () => <div data-testid="balance-section" />,
}));
vi.mock("./RequestSummaryCards", () => ({
  RequestSummaryCards: () => <div data-testid="summary-cards" />,
}));
vi.mock("./RequestsTable", () => ({
  RequestsTable: () => <div data-testid="requests-table" />,
}));

describe("MyRequestsView", () => {
  const mockDataEmpty = {
    myRequests: {
      nodes: [],
      totalCount: 0,
    },
    myBalance: {},
  };

  const mockDataPopulated = {
    myRequests: {
      nodes: [{ id: "1", requestNumber: "REQ-1" }],
      totalCount: 1,
    },
    myBalance: {},
  };

  it("renders empty state", () => {
    (useSuspenseQuery as any).mockReturnValue({ data: mockDataEmpty });

    render(<MyRequestsView />);

    expect(screen.getByTestId("balance-section")).toBeInTheDocument();
    expect(screen.getByTestId("summary-cards")).toBeInTheDocument();
    expect(screen.getByTestId("requests-table")).toBeInTheDocument();
  });

  it("renders populated state", () => {
    (useSuspenseQuery as any).mockReturnValue({ data: mockDataPopulated });

    render(<MyRequestsView />);

    expect(screen.getByTestId("balance-section")).toBeInTheDocument();
    expect(screen.getByTestId("summary-cards")).toBeInTheDocument();
    expect(screen.getByTestId("requests-table")).toBeInTheDocument();
  });
});
