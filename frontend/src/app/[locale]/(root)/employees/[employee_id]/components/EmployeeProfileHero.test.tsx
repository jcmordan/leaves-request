import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { EmployeeProfileHero } from "./EmployeeProfileHero";
import { useFragment } from "@/__generated__";
import { useSheets } from "@/components/layout/sheets/SheetNavigation";

// Mock dependencies
vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

vi.mock("@/components/layout/sheets/SheetNavigation", () => ({
  useSheets: vi.fn(),
}));

describe("EmployeeProfileHero", () => {
  const openSheetMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSheets as any).mockReturnValue({ openSheet: openSheetMock });
  });

  const mockEmployee = {
    id: "emp-1",
    fullName: "John Doe",
    isActive: true,
    jobTitle: {
      name: "Software Engineer",
    },
  };

  it("renders employee information correctly", () => {
    vi.mocked(useFragment).mockReturnValue(mockEmployee);
    render(<EmployeeProfileHero employeeRef={{} as any} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("common.active")).toBeInTheDocument();
  });

  it("renders inactive status when employee is not active", () => {
    vi.mocked(useFragment).mockReturnValue({ ...mockEmployee, isActive: false });
    render(<EmployeeProfileHero employeeRef={{} as any} />);

    expect(screen.getByText("common.inactive")).toBeInTheDocument();
  });

  it("renders dash for missing job title", () => {
    vi.mocked(useFragment).mockReturnValue({ ...mockEmployee, jobTitle: null });
    render(<EmployeeProfileHero employeeRef={{} as any} />);

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("calls openSheet when edit button is clicked", () => {
    vi.mocked(useFragment).mockReturnValue(mockEmployee);
    render(<EmployeeProfileHero employeeRef={{} as any} />);

    const editButton = screen.getByText("employees.editProfile");
    fireEvent.click(editButton);

    expect(openSheetMock).toHaveBeenCalledWith(
      "EmployeeEditSheet",
      { employeeId: "emp-1" },
      { width: "xl" }
    );
  });
});
