import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RequestOverviewSection } from "./RequestOverviewSection";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock GraphQL fragments
vi.mock("@/__generated__", () => ({
  useFragment: (_fragment: any, data: any) => data,
  graphql: (s: any) => s,
}));

const mockRequest = {
  id: "1",
  startDate: "2024-10-24T00:00:00Z",
  endDate: "2024-10-26T00:00:00Z",
  totalDaysRequested: 3,
  status: "PENDING" as const,
  reason: "Seasonal flu",
  absenceType: { id: "t1", name: "Sick Leave" },
  diagnosis: null,
  treatingDoctor: null,
  createdAt: "2024-10-23T09:00:00Z",
  employee: { id: "e1", fullName: "Alexander Thorne" },
  requesterEmployee: { id: "e1", fullName: "Alexander Thorne" },
  attachments: [],
  approvalHistories: [],
};

describe("RequestOverviewSection", () => {
  it("should display the absence type name", () => {
    render(<RequestOverviewSection requestRef={mockRequest as any} />);

    expect(screen.getByText("Sick Leave")).toBeInTheDocument();
  });

  it("should display total days requested", () => {
    render(<RequestOverviewSection requestRef={mockRequest as any} />);

    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it("should display formatted start and end dates", () => {
    render(<RequestOverviewSection requestRef={mockRequest as any} />);

    expect(screen.getByText(/Oct 24, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Oct 26, 2024/)).toBeInTheDocument();
  });

});
