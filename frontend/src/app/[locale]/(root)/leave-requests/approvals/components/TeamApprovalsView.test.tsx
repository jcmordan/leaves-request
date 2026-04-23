import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TeamApprovalsView from "./TeamApprovalsView";
import { useSuspenseQuery } from "@apollo/client/react";
import { useSearchParams } from "next/navigation";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    number: (v: any) => v,
    dateTime: (v: any) => v,
  }),
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
vi.mock("../graphql/ApprovalListQueries", () => ({
  GET_APPROVALS_DASHBOARD_QUERY: "GET_APPROVALS_DASHBOARD_QUERY",
}));

// Mock components
vi.mock("../../shared/components/RequestsTable", () => ({
  RequestsTable: ({ basePath }: any) => <div data-testid="requests-table">basePath: {basePath}</div>,
}));

vi.mock("../../shared/components/dashboard/DashboardMetricCards", () => ({
  DashboardMetricCards: () => <div data-testid="metric-cards" />,
}));

vi.mock("../../shared/components/dashboard/DashboardCapacityCard", () => ({
  DashboardCapacityCard: () => <div data-testid="capacity-card" />,
}));

vi.mock("../../shared/components/dashboard/DashboardInsightCard", () => ({
  DashboardInsightCard: () => <div data-testid="insight-card" />,
}));

describe("TeamApprovalsView", () => {
  it("renders the dashboard sections when data is available", () => {
    (useSearchParams as any).mockReturnValue({
      get: (key: string) => null,
    });

    (useSuspenseQuery as any).mockReturnValue({
       data: { 
         teamAbsences: { nodes: [] },
         leaveRequestSummary: { id: "summary-1" }
       }
    });

    render(<TeamApprovalsView />);

    expect(screen.getByText("teamApprovalsTitle")).toBeInTheDocument();
    expect(screen.getByTestId("capacity-card")).toBeInTheDocument();
    expect(screen.getByTestId("metric-cards")).toBeInTheDocument();
    expect(screen.getByTestId("insight-card")).toBeInTheDocument();
    expect(screen.getByTestId("requests-table")).toBeInTheDocument();
  });

  it("handles missing summary data gracefully", () => {
    (useSearchParams as any).mockReturnValue({
      get: (key: string) => null,
    });

    (useSuspenseQuery as any).mockReturnValue({
       data: { 
         teamAbsences: { nodes: [] },
         leaveRequestSummary: null
       }
    });

    render(<TeamApprovalsView />);

    expect(screen.queryByTestId("capacity-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("metric-cards")).not.toBeInTheDocument();
    expect(screen.queryByTestId("insight-card")).not.toBeInTheDocument();
    expect(screen.getByTestId("requests-table")).toBeInTheDocument();
  });
});
