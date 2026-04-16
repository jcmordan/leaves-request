import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AllRequestsView from "./AllRequestsView";
import { useSuspenseQuery } from "@apollo/client/react";
import { useSearchParams } from "next/navigation";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

// Mock apollo
vi.mock("@apollo/client/react", () => ({
  useSuspenseQuery: vi.fn(),
}));

// Mock graphql
vi.mock("../graphql/AdministrationQueries", () => ({
  ALL_REQUESTS_QUERY: "ALL_REQUESTS_QUERY",
}));

// Mock components
vi.mock("../../shared/components/RequestsTable", () => ({
  RequestsTable: ({ basePath }: any) => <div data-testid="requests-table">basePath: {basePath}</div>,
}));

describe("AllRequestsView", () => {
  it("renders correctly and passes correct variables to query", () => {
    (useSearchParams as any).mockReturnValue({
      get: (key: string) => {
        if (key === "status") return "pending";
        return null;
      },
    });

    (useSuspenseQuery as any).mockReturnValue({
       data: { absenceRequests: { nodes: [] } }
    });

    render(<AllRequestsView />);

    expect(screen.getByText("allRequestsTitle")).toBeInTheDocument();
    expect(screen.getByTestId("requests-table")).toHaveTextContent("basePath: all");
    
    // Verify query variables (mocking first vs last logic)
    expect(useSuspenseQuery).toHaveBeenCalledWith(expect.anything(), {
      variables: expect.objectContaining({
        status: "PENDING",
        first: 10,
      }),
    });
  });

  it("handles pagination parameters correctly", () => {
    (useSearchParams as any).mockReturnValue({
      get: (key: string) => {
        if (key === "before") return "cursor-123";
        return null;
      },
    });

    (useSuspenseQuery as any).mockReturnValue({
       data: { absenceRequests: { nodes: [] } }
    });

    render(<AllRequestsView />);

    // Should use 'last' when 'before' is present
    expect(useSuspenseQuery).toHaveBeenCalledWith(expect.anything(), {
      variables: expect.objectContaining({
        last: 10,
        before: "cursor-123",
      }),
    });
  });
});
