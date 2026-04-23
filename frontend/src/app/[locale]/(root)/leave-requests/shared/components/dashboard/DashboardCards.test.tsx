import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PendingCountCard } from "./PendingCountCard";
import { RejectedCountCard } from "./RejectedCountCard";
import { DashboardInsightCard } from "./DashboardInsightCard";
import { useFragment } from "@/__generated__";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: any) => {
    if (params?.count !== undefined) return `${key} ${params.count}`;
    if (params?.value !== undefined) return `${key} ${params.value}`;
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

describe("Dashboard Cards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PendingCountCard", () => {
    it("renders with correct count and response time", () => {
      (useFragment as any).mockReturnValue({
        pendingCount: 8,
        avgResponseTimeHours: 14.5,
      });

      render(<PendingCountCard summaryRef={{} as any} />);

      expect(screen.getByText(/pendingCountTitle 8/)).toBeInTheDocument();
      expect(screen.getByText(/avgResponseTime 14.5/)).toBeInTheDocument();
    });
  });

  describe("RejectedCountCard", () => {
    it("renders with correct rejected count", () => {
      (useFragment as any).mockReturnValue({
        rejectedCount: 3,
      });

      render(<RejectedCountCard summaryRef={{} as any} />);

      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("rejectedTotal")).toBeInTheDocument();
    });
  });

  describe("DashboardInsightCard", () => {
    it("renders insight message when available", () => {
      (useFragment as any).mockReturnValue({
        insightMessage: "High volume of requests on Friday.",
      });

      render(<DashboardInsightCard summaryRef={{} as any} />);

      expect(screen.getByText("High volume of requests on Friday.")).toBeInTheDocument();
      expect(screen.getByText("managerTip")).toBeInTheDocument();
    });

    it("returns null when no insight message", () => {
      (useFragment as any).mockReturnValue({
        insightMessage: null,
      });

      const { container } = render(<DashboardInsightCard summaryRef={{} as any} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
