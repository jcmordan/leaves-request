import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeeDetailsTopBar } from "./EmployeeDetailsTopBar";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("EmployeeDetailsTopBar", () => {
  it("renders employee management heading", () => {
    render(<EmployeeDetailsTopBar />);

    expect(screen.getByText("employeeManagement")).toBeInTheDocument();
  });

  it("renders navigation tabs", () => {
    render(<EmployeeDetailsTopBar />);

    expect(screen.getByText("directory")).toBeInTheDocument();
    expect(screen.getByText("orgChart")).toBeInTheDocument();
    expect(screen.getByText("reports")).toBeInTheDocument();
  });

  it("renders directory link pointing to /employees", () => {
    render(<EmployeeDetailsTopBar />);

    const directoryLink = screen.getByText("directory");
    expect(directoryLink.closest("a")).toHaveAttribute("href", "/employees");
  });
});
