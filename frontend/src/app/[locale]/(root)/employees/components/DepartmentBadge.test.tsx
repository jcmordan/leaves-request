import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DepartmentBadge } from "./DepartmentBadge";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: { default?: string }) =>
    values?.default ?? key,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <span data-testid="badge" className={className}>
      {children}
    </span>
  ),
}));

describe("DepartmentBadge", () => {
  it("uses mapped colors for known departments", () => {
    render(<DepartmentBadge department="Human Resources" />);

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Human Resources");
    expect(badge.className).toContain("bg-rose-50");
    expect(badge.className).toContain("text-rose-700");
  });

  it("uses fallback colors for unknown departments", () => {
    render(<DepartmentBadge department="Unknown Team" />);

    const badge = screen.getByTestId("badge");
    expect(badge.className).toContain("bg-gray-50");
    expect(badge.className).toContain("text-gray-700");
  });
});
