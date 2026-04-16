import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardCapacityCard } from "./DashboardCapacityCard";
import { useFragment } from "@/__generated__";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: any) => {
    if (key === "minCapacityForecast" && params?.percentage) return `Min: ${params.percentage}%`;
    return key;
  },
  useFormatter: () => ({
    dateTime: (d: Date) => d.toLocaleDateString(),
  }),
}));

// Mock fragments
vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
}));

vi.mock("../graphql/ApprovalListQueries", () => ({
  DASHBOARD_SUMMARY_FIELDS: "DASHBOARD_SUMMARY_FIELDS",
}));

// Mock DashboardInfoTooltip
vi.mock("./DashboardInfoTooltip", () => ({
  DashboardInfoTooltip: () => <div data-testid="info-tooltip" />,
}));

// Mock Recharts
vi.mock("recharts", () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

describe("DashboardCapacityCard", () => {
  const baseSummary = {
    availablePercentage: 80,
    totalTeamMembers: 10,
    membersOnLeave: 2,
    pendingMembersOnLeave: 0,
    upcomingMinAvailablePercentage: 70,
    upcomingMinAvailableDate: "2026-04-20T00:00:00Z",
  };

  it("renders normal capacity state correctly", () => {
    (useFragment as any).mockReturnValue(baseSummary);

    render(<DashboardCapacityCard summaryRef={{} as any} />);

    expect(screen.getByText("teamCapacity")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("Min: 70%")).toBeInTheDocument();
    
    // Zap icon color check (should not be red)
    const zap = document.querySelector(".lucide-zap");
    expect(zap).not.toHaveClass("text-red-500");
  });

  it("renders high risk state correctly when percentage is low", () => {
    (useFragment as any).mockReturnValue({
      ...baseSummary,
      availablePercentage: 55,
      upcomingMinAvailablePercentage: 45,
    });

    render(<DashboardCapacityCard summaryRef={{} as any} />);

    expect(screen.getByText("55%")).toBeInTheDocument();
    expect(screen.getByText("Min: 45%")).toBeInTheDocument();
    
    // Zap icon color check (high risk)
    const zap = document.querySelector(".lucide-zap");
    expect(zap).toHaveClass("text-red-500");
    expect(zap).toHaveClass("animate-bounce");
  });

  it("handles missing forecast date gracefully", () => {
    (useFragment as any).mockReturnValue({
      ...baseSummary,
      upcomingMinAvailableDate: null,
    });

    render(<DashboardCapacityCard summaryRef={{} as any} />);

    expect(screen.getByText(/N\/A/i)).toBeInTheDocument();
  });

  it("links to the detailed schedule", () => {
    (useFragment as any).mockReturnValue(baseSummary);

    render(<DashboardCapacityCard summaryRef={{} as any} />);

    const link = screen.getByRole("link", { name: /detailedSchedule/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/leave-requests/team-capacity");
  });
});
