import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeeUpcomingEventsCard } from "./EmployeeUpcomingEventsCard";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("EmployeeUpcomingEventsCard", () => {
  it("renders upcoming events heading", () => {
    render(<EmployeeUpcomingEventsCard />);

    expect(screen.getByText("Upcoming Events")).toBeInTheDocument();
  });

  it("renders hardcoded events", () => {
    render(<EmployeeUpcomingEventsCard />);

    expect(
      screen.getByText("Annual Performance Review"),
    ).toBeInTheDocument();
    expect(screen.getByText("Department Townhall")).toBeInTheDocument();
  });

  it("renders event types as badges", () => {
    render(<EmployeeUpcomingEventsCard />);

    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Meeting")).toBeInTheDocument();
  });

  it("renders event dates", () => {
    render(<EmployeeUpcomingEventsCard />);

    expect(screen.getByText("Oct 24, 2024")).toBeInTheDocument();
    expect(screen.getByText("Mar 12, 2024")).toBeInTheDocument();
  });

  it("renders star performer section", () => {
    render(<EmployeeUpcomingEventsCard />);

    expect(screen.getByText("Star Performer")).toBeInTheDocument();
    expect(screen.getByText("Top 5% of Q1 2024")).toBeInTheDocument();
  });
});
