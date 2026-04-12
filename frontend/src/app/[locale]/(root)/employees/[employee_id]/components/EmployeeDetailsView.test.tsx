import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeeDetailsView } from "./EmployeeDetailsView";

const useSuspenseQueryMock = vi.fn();

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@apollo/client/react", () => ({
  useSuspenseQuery: (...args: unknown[]) => useSuspenseQueryMock(...args),
}));

vi.mock("@/__generated__", () => ({
  graphql: (s: string) => s,
}));

vi.mock("./EmployeeProfileHero", () => ({
  EmployeeProfileHero: () => <div data-testid="profile-hero" />,
}));

vi.mock("./EmployeePersonalInformationCard", () => ({
  EmployeePersonalInformationCard: () => <div data-testid="personal-info" />,
}));

vi.mock("./EmployeeCorporateDataCard", () => ({
  EmployeeCorporateDataCard: () => <div data-testid="corporate-data" />,
}));

vi.mock("./EmployeeReportingStructureCard", () => ({
  EmployeeReportingStructureCard: () => (
    <div data-testid="reporting-structure" />
  ),
}));

vi.mock("./EmployeeLeaveBalanceCard", () => ({
  EmployeeLeaveBalanceCard: () => <div data-testid="leave-balance" />,
}));

vi.mock("./EmployeeUpcomingEventsCard", () => ({
  EmployeeUpcomingEventsCard: () => <div data-testid="upcoming-events" />,
}));

describe("EmployeeDetailsView", () => {
  it("renders error state when query returns error", () => {
    useSuspenseQueryMock.mockReturnValue({
      data: null,
      error: new Error("Something went wrong"),
    });

    render(<EmployeeDetailsView employeeId="123" />);

    expect(
      screen.getByText("Error loading employee"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please try again later or contact support."),
    ).toBeInTheDocument();
  });

  it("renders error state when employee is null", () => {
    useSuspenseQueryMock.mockReturnValue({
      data: { employee: null },
      error: null,
    });

    render(<EmployeeDetailsView employeeId="123" />);

    expect(
      screen.getByText("Error loading employee"),
    ).toBeInTheDocument();
  });

  it("renders all child components when data is available", () => {
    const mockEmployee = {
      id: "123",
      fullName: "John Doe",
      isActive: true,
      jobTitle: { id: "1", name: "Engineer" },
    };

    useSuspenseQueryMock.mockReturnValue({
      data: { employee: mockEmployee },
      error: null,
    });

    render(<EmployeeDetailsView employeeId="123" />);

    expect(screen.getByTestId("profile-hero")).toBeInTheDocument();
    expect(screen.getByTestId("personal-info")).toBeInTheDocument();
    expect(screen.getByTestId("corporate-data")).toBeInTheDocument();
    expect(screen.getByTestId("reporting-structure")).toBeInTheDocument();
    expect(screen.getByTestId("leave-balance")).toBeInTheDocument();
    expect(screen.getByTestId("upcoming-events")).toBeInTheDocument();
  });

  it("passes employeeId as variable to useSuspenseQuery", () => {
    useSuspenseQueryMock.mockReturnValue({
      data: { employee: { id: "456" } },
      error: null,
    });

    render(<EmployeeDetailsView employeeId="456" />);

    expect(useSuspenseQueryMock).toHaveBeenCalledWith(expect.anything(), {
      variables: { id: "456" },
    });
  });
});
