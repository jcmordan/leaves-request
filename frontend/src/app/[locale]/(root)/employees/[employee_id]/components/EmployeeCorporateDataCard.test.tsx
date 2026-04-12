import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeeCorporateDataCard } from "./EmployeeCorporateDataCard";

const useFragmentMock = vi.fn((_, ref) => ref);

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

describe("EmployeeCorporateDataCard", () => {
  it("renders employee corporate data", () => {
    const mockEmployee = {
      employeeCode: "EMP-001",
      an8: "12345678",
      department: { id: "1", name: "Engineering" },
      company: { id: "2", name: "Refidomsa" },
    };

    render(<EmployeeCorporateDataCard employeeRef={mockEmployee as any} />);

    expect(screen.getByText("corporateData")).toBeInTheDocument();
    expect(screen.getByText("EMP-001")).toBeInTheDocument();
    expect(screen.getByText("12345678")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Refidomsa")).toBeInTheDocument();
  });

  it("renders dash when department is null", () => {
    const mockEmployee = {
      employeeCode: "EMP-002",
      an8: "99999",
      department: null,
      company: null,
    };

    render(<EmployeeCorporateDataCard employeeRef={mockEmployee as any} />);

    const dashes = screen.getAllByText("-");
    expect(dashes).toHaveLength(2);
  });
});
