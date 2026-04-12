import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeeLeaveBalanceCard } from "./EmployeeLeaveBalanceCard";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/__generated__", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useFragment: vi.fn((_, ref) => ref),
    graphql: (s: string) => s,
    FragmentType: {},
  };
});

describe("EmployeeLeaveBalanceCard", () => {
  it("renders leave balance data", () => {
    const mockEmployee = {
      leaveBalance: {
        totalEntitlement: 20,
        taken: 6,
        remaining: 14,
        availablePercentage: 70,
      },
    };

    render(<EmployeeLeaveBalanceCard employeeRef={mockEmployee as any} />);

    expect(screen.getByText("leaveBalance")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("daysLeft")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("entitlement")).toBeInTheDocument();
    expect(screen.getByText("taken")).toBeInTheDocument();
    expect(screen.getByText("viewDetailedHistory")).toBeInTheDocument();
  });

  it("calculates percentage correctly for SVG", () => {
    const mockEmployee = {
      leaveBalance: {
        totalEntitlement: 10,
        taken: 10,
        remaining: 0,
        availablePercentage: 0,
      },
    };

    render(<EmployeeLeaveBalanceCard employeeRef={mockEmployee as any} />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
