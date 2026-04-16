import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { RequestSummaryCard } from "./RequestSummaryCard";
import { useFragment } from "@/__generated__";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "daysCount" && params) return `${params.count} days`;
    return key;
  },
  useFormatter: () => ({
    dateTime: vi.fn((d, options) => {
      if (options?.month === "short" && options?.year === "numeric") return "Oct 28, 2023";
      if (options?.month === "short") return "Oct 24";
      if (options?.hour === "2-digit") return "10:45 AM";
      return "Oct 20, 2023";
    }),
    number: vi.fn((n) => n.toString()),
  }),
}));

vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
}));

describe("RequestSummaryCard", () => {
  const mockRequest = {
    id: "req-123",
    startDate: "2023-10-24T00:00:00Z",
    endDate: "2023-10-28T23:59:59Z",
    totalDaysRequested: 5,
    createdAt: "2023-10-20T10:45:00Z",
    absenceType: {
      name: "Medical Leave",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFragment as any).mockReturnValue(mockRequest);
  });

  it("renders correct request details", () => {
    render(<RequestSummaryCard requestRef={{} as any} />);

    expect(screen.getByText("Medical Leave")).toBeInTheDocument();
    expect(screen.getByText(/Oct 24 - Oct 28, 2023/i)).toBeInTheDocument();
    expect(screen.getByText(/5 days/i)).toBeInTheDocument();
  });
});
