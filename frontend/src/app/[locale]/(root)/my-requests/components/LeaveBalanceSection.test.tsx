import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LeaveBalanceSection } from "./LeaveBalanceSection";
import { useFragment } from "@/__generated__";
import type { ReactNode } from "react";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock @/__generated__
vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: string) => s,
}));

describe("LeaveBalanceSection", () => {
  const mockBalance = {
    totalEntitlement: 20,
    taken: 5,
    remaining: 15,
  };

  it("renders balance information correctly", () => {
    (useFragment as any).mockReturnValue(mockBalance);

    render(<LeaveBalanceSection balanceRef={{} as any} />);

    expect(screen.getByText("leaveBalance 2026")).toBeInTheDocument();
    expect(screen.getByText("5 / 20 days")).toBeInTheDocument();
    expect(screen.getByText("05")).toBeInTheDocument(); // taken
    expect(screen.getByText("15")).toBeInTheDocument(); // remaining
  });

  it("renders new request link", () => {
    (useFragment as any).mockReturnValue(mockBalance);

    render(<LeaveBalanceSection balanceRef={{} as any} />);

    const link = screen.getByRole("link", { name: /newRequest/i });
    expect(link).toHaveAttribute("href", "/en/requests/new");
  });
});
