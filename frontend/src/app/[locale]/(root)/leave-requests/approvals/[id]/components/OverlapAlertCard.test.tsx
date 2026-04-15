import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OverlapAlertCard } from "./OverlapAlertCard";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      overlappingAbsences: "Overlapping Absences",
      teamOverlapsCount: "{count} team members overlapping",
    };
    const template = translations[key] || key;
    if (!params) return template;
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
      template,
    );
  },
}));

describe("OverlapAlertCard", () => {
  it("renders overlap alerts correctly", () => {
    render(<OverlapAlertCard startDate="2023-10-24" endDate="2023-10-28" />);

    expect(screen.getByText("Overlapping Absences")).toBeInTheDocument();
    expect(screen.getByText(/2 team members overlapping/i)).toBeInTheDocument();
    expect(screen.getByText("Sarah Wilson")).toBeInTheDocument();
    expect(screen.getByText("Marcus Chen")).toBeInTheDocument();
  });
});
