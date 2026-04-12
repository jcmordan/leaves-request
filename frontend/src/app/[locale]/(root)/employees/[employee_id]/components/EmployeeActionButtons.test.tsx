import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeeActionButtons } from "./EmployeeActionButtons";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("EmployeeActionButtons", () => {
  it("renders edit profile and contact buttons", () => {
    render(<EmployeeActionButtons />);

    expect(screen.getByText("editProfile")).toBeInTheDocument();
    expect(screen.getByText("contact")).toBeInTheDocument();
  });

  it("renders two buttons", () => {
    render(<EmployeeActionButtons />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });
});
