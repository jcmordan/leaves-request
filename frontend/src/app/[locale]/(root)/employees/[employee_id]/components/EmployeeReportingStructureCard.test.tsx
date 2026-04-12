import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeeReportingStructureCard } from "./EmployeeReportingStructureCard";

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
  getInitials: (name: string) =>
    name
      .split(" ")
      .map((n: string) => n[0])
      .join(""),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/employees/123",
}));

describe("EmployeeReportingStructureCard", () => {
  it("renders manager information", () => {
    const mockEmployee = {
      manager: {
        id: "mgr-1",
        fullName: "Jane Manager",
        jobTitle: { id: "1", name: "Director" },
      },
      subordinates: [],
    };

    render(
      <EmployeeReportingStructureCard employeeRef={mockEmployee as any} />,
    );

    expect(screen.getByText("reportingStructure")).toBeInTheDocument();
    expect(screen.getByText("reportsTo")).toBeInTheDocument();
    expect(screen.getByText("Jane Manager")).toBeInTheDocument();
    expect(screen.getByText("Director")).toBeInTheDocument();
    expect(screen.getByText("JM")).toBeInTheDocument();
  });

  it("renders dash when manager is null", () => {
    const mockEmployee = {
      manager: null,
      subordinates: [],
    };

    render(
      <EmployeeReportingStructureCard employeeRef={mockEmployee as any} />,
    );

    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("renders subordinates with overflow indicator", () => {
    const mockEmployee = {
      manager: {
        id: "mgr-1",
        fullName: "Jane Manager",
        jobTitle: { id: "1", name: "Director" },
      },
      subordinates: [
        { id: "sub-1", fullName: "Alice Sub" },
        { id: "sub-2", fullName: "Bob Sub" },
        { id: "sub-3", fullName: "Charlie Sub" },
        { id: "sub-4", fullName: "Diana Sub" },
      ],
    };

    render(
      <EmployeeReportingStructureCard employeeRef={mockEmployee as any} />,
    );

    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByText("directReports_4")).toBeInTheDocument();
  });

  it("does not render overflow when 3 or fewer subordinates", () => {
    const mockEmployee = {
      manager: {
        id: "mgr-1",
        fullName: "Jane Manager",
        jobTitle: { id: "1", name: "Director" },
      },
      subordinates: [
        { id: "sub-1", fullName: "Alice Sub" },
        { id: "sub-2", fullName: "Bob Sub" },
      ],
    };

    render(
      <EmployeeReportingStructureCard employeeRef={mockEmployee as any} />,
    );

    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });
});
