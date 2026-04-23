import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LeaveTrendsCard } from "./LeaveTrendsCard";
import { useFragment } from "@/__generated__";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: any) => {
    if (key === "mostRequestedPrompt" && params?.day) return `Most requested: ${params.day}`;
    return key;
  },
}));

// Mock fragments
vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
}));

// Mock DashboardInfoTooltip
vi.mock("./DashboardInfoTooltip", () => ({
  DashboardInfoTooltip: () => <div data-testid="info-tooltip" />,
}));

// Mock Recharts to avoid rendering issues in test environment
vi.mock("recharts", () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Cell: () => null,
  XAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  LabelList: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

describe("LeaveTrendsCard", () => {
  it("renders with trend data and identifies peak day", () => {
    const mockData = {
      trendData: [
        { label: "Monday", count: 2 },
        { label: "Tuesday", count: 5 },
        { label: "Wednesday", count: 1 },
      ],
    };
    (useFragment as any).mockReturnValue(mockData);

    render(<LeaveTrendsCard summaryRef={{} as any} />);

    expect(screen.getByText("usageTendencies")).toBeInTheDocument();
    expect(screen.getByText("Most requested: Tuesday")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("renders empty state message when no trend data is present", () => {
    (useFragment as any).mockReturnValue({ trendData: [] });

    render(<LeaveTrendsCard summaryRef={{} as any} />);

    expect(screen.getByText("noPatternsIdentified")).toBeInTheDocument();
  });

  it("renders empty state message when counts are zero", () => {
    (useFragment as any).mockReturnValue({
      trendData: [
        { label: "Monday", count: 0 },
        { label: "Tuesday", count: 0 },
      ],
    });

    render(<LeaveTrendsCard summaryRef={{} as any} />);

    expect(screen.getByText("noPatternsIdentified")).toBeInTheDocument();
  });
});
