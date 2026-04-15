import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OverlapAlertCard } from "./OverlapAlertCard";
import { useFragment } from "@/__generated__";

vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
}));

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
  const mockOverlapData = {
    overlappingAbsences: [
      {
        employeeName: "Sarah Wilson",
        jobTitle: "UI Designer",
        startDate: "2023-10-24",
        endDate: "2023-10-28",
      },
      {
        employeeName: "Marcus Chen",
        jobTitle: "Lead Developer",
        startDate: "2023-10-25",
        endDate: "2023-10-26",
      },
    ],
  };

  it("renders overlap alerts correctly", () => {
    vi.mocked(useFragment).mockReturnValue(mockOverlapData);
    render(<OverlapAlertCard absenceAnalysisRef={{} as any} />);

    expect(screen.getByText("Overlapping Absences")).toBeInTheDocument();
    expect(screen.getByText(/2 team members overlapping/i)).toBeInTheDocument();
    expect(screen.getByText("Sarah Wilson")).toBeInTheDocument();
    expect(screen.getByText("Marcus Chen")).toBeInTheDocument();
  });

  it("renders null when no data is provided", () => {
    vi.mocked(useFragment).mockReturnValue(null);
    const { container } = render(<OverlapAlertCard absenceAnalysisRef={null} />);
    expect(container.firstChild).toBeNull();
  });
});
