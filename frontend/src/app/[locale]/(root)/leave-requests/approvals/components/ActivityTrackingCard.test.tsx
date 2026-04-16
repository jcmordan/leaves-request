import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ActivityTrackingCard } from "./ActivityTrackingCard";
import { useFragment } from "@/__generated__";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: any) => {
    if (params && params.value) return `vsLastYear ${params.value}`;
    return key;
  },
  useFormatter: () => ({
    number: (val: number) => val.toString(),
  }),
}));

vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
  DASHBOARD_SUMMARY_FIELDS: {},
}));

vi.mock("./DashboardInfoTooltip", () => ({
  DashboardInfoTooltip: () => <div data-testid="tooltip" />,
}));

describe("ActivityTrackingCard", () => {
  const mockSummary = {
    approvedThisMonthCount: 15,
    approvedVsLastYearPercentage: 12.5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFragment as any).mockReturnValue(mockSummary);
  });

  it("renders correctly with positive percentage", () => {
    render(<ActivityTrackingCard summaryRef={{} as any} />);

    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("approved")).toBeInTheDocument();
    expect(screen.getByText("vsLastYear +12.5")).toBeInTheDocument();
  });

  it("renders correctly with negative percentage", () => {
    (useFragment as any).mockReturnValue({
      ...mockSummary,
      approvedVsLastYearPercentage: -5.2,
    });

    render(<ActivityTrackingCard summaryRef={{} as any} />);

    expect(screen.getByText("vsLastYear -5.2")).toBeInTheDocument();
  });
});
