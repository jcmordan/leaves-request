import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeeProfileHero } from "./EmployeeProfileHero";

const openSheetMock = vi.fn();

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

vi.mock("@/utils/formatters", () => ({
  getInitials: (name: string) =>
    name
      .split(" ")
      .map((n: string) => n[0])
      .join(""),
}));

vi.mock("@/components/layout/sheets/SheetNavigation", () => ({
  useSheets: () => ({ openSheet: openSheetMock }),
}));

describe("EmployeeProfileHero", () => {
  const mockEmployee = {
    id: "123",
    fullName: "John Doe",
    isActive: true,
    jobTitle: { id: "1", name: "Software Engineer" },
  };

  it("renders employee name and job title", () => {
    render(<EmployeeProfileHero employeeRef={mockEmployee as any} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("renders initials", () => {
    render(<EmployeeProfileHero employeeRef={mockEmployee as any} />);

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders active badge when employee is active", () => {
    render(<EmployeeProfileHero employeeRef={mockEmployee as any} />);

    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders inactive badge when employee is not active", () => {
    const inactiveEmployee = { ...mockEmployee, isActive: false };
    render(<EmployeeProfileHero employeeRef={inactiveEmployee as any} />);

    expect(screen.getByText("inactive")).toBeInTheDocument();
  });

  it("renders dash when jobTitle is null", () => {
    const noTitleEmployee = { ...mockEmployee, jobTitle: null };
    render(<EmployeeProfileHero employeeRef={noTitleEmployee as any} />);

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("opens edit sheet when edit button is clicked", () => {
    render(<EmployeeProfileHero employeeRef={mockEmployee as any} />);

    fireEvent.click(screen.getByText("editProfile"));

    expect(openSheetMock).toHaveBeenCalledWith(
      "EmployeeEditSheet",
      { employeeId: "123" },
      { width: "xl" },
    );
  });
});
