import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardMetricCards } from "./DashboardMetricCards";

vi.mock("./PendingCountCard", () => ({
  PendingCountCard: () => <div data-testid="pending-card" />,
}));
vi.mock("./ActivityTrackingCard", () => ({
  ActivityTrackingCard: () => <div data-testid="activity-card" />,
}));
vi.mock("./LeaveTrendsCard", () => ({
  LeaveTrendsCard: () => <div data-testid="trends-card" />,
}));
vi.mock("./RejectedCountCard", () => ({
  default: () => <div data-testid="rejected-card" />,
}));

describe("DashboardMetricCards", () => {
  it("renders all sub-metric cards", () => {
    render(<DashboardMetricCards summaryRef={{} as any} />);

    expect(screen.getByTestId("pending-card")).toBeInTheDocument();
    expect(screen.getByTestId("activity-card")).toBeInTheDocument();
    expect(screen.getByTestId("trends-card")).toBeInTheDocument();
    expect(screen.getByTestId("rejected-card")).toBeInTheDocument();
  });
});
