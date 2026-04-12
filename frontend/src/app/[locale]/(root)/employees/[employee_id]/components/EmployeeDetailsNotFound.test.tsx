import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeeDetailsNotFound } from "./EmployeeDetailsNotFound";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("EmployeeDetailsNotFound", () => {
  it("renders not found title and description", () => {
    render(<EmployeeDetailsNotFound />);

    expect(screen.getByText("notFoundTitle")).toBeInTheDocument();
    expect(screen.getByText("notFoundDescription")).toBeInTheDocument();
  });

  it("renders back to directory link", () => {
    render(<EmployeeDetailsNotFound />);

    const link = screen.getByText("backToDirectory");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/employees");
  });
});
