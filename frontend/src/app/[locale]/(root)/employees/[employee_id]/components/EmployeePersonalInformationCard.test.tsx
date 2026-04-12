import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeePersonalInformationCard } from "./EmployeePersonalInformationCard";

vi.mock("next-intl", () => ({
  useTranslations:
    () =>
    (key: string, params?: Record<string, unknown>) => {
      if (params?.count !== undefined) return `${key}_${params.count}`;
      return key;
    },
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

vi.mock("@/utils/formatters", () => ({
  formatNationalId: (id: string) => `formatted-${id}`,
  formatDate: (date: string, _fmt: string) => `formatted-date-${date}`,
}));

vi.mock("@/utils/dateUtils", () => ({
  calculateAge: () => 5,
  fromNow: () => "5 years ago",
}));

describe("EmployeePersonalInformationCard", () => {
  it("renders personal information fields", () => {
    const mockEmployee = {
      email: "john@example.com",
      nationalId: "001-1234567-8",
      hireDate: "2019-01-15",
    };

    render(
      <EmployeePersonalInformationCard employeeRef={mockEmployee as any} />,
    );

    expect(screen.getByText("personalInformation")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("formatted-001-1234567-8")).toBeInTheDocument();
    expect(
      screen.getByText("formatted-date-2019-01-15"),
    ).toBeInTheDocument();
  });

  it("renders dash when email is null", () => {
    const mockEmployee = {
      email: null,
      nationalId: "001-0000000-0",
      hireDate: "2020-06-01",
    };

    render(
      <EmployeePersonalInformationCard employeeRef={mockEmployee as any} />,
    );

    expect(screen.getByText("-")).toBeInTheDocument();
  });
});
