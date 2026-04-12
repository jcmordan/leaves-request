import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatsSection } from "./StatsSection";
import { useFragment } from "@/__generated__";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    number: (val: number) => val.toString(),
  }),
}));

// Mock @/__generated__
vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: string) => s,
}));

describe("StatsSection", () => {
  const mockStats = {
    employeeStats: {
      total: 100,
      active: 80,
      onLeave: 15,
      inactive: 5,
    },
  };

  it("renders all stat cards with correct values", () => {
    (useFragment as any).mockReturnValue(mockStats);

    render(<StatsSection statsQueryRef={{} as any} />);

    expect(screen.getByText("statsTotal")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();

    expect(screen.getByText("statsActive")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();

    expect(screen.getByText("statsOnLeave")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();

    expect(screen.getByText("statsInactive")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
