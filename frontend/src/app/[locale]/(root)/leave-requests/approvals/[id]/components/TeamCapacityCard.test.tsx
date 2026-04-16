import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TeamCapacityCard } from "./TeamCapacityCard";
import { useFragment } from "@/__generated__";

vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      teamCapacity: "Team Capacity",
      available: "Available",
      capacityPercentage: "{percentage}%",
      totalMembers: "Total Members",
      onLeave: "On Leave",
      pendingRequests: "Pending Requests",
    };
    const template = translations[key] || key;
    if (!params) return template;
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
      template,
    );
  },
  useFormatter: () => ({
    dateTime: vi.fn((d, options) => new Intl.DateTimeFormat("en-US", options).format(d)),
    number: vi.fn((n) => n.toString()),
  }),
  useLocale: () => "en",
}));

describe("TeamCapacityCard", () => {
  const mockAnalyzeData = {
    availablePercentage: 85,
    totalTeamMembers: 20,
    membersOnLeave: 2,
    pendingMembersOnLeave: 1,
  };

  it("renders capacity percentage", () => {
    vi.mocked(useFragment).mockReturnValue(mockAnalyzeData);
    render(<TeamCapacityCard absenceAnalysisRef={{} as any} />);

    expect(screen.getByText("Team Capacity")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("renders the SVG circular progress", () => {
    vi.mocked(useFragment).mockReturnValue(mockAnalyzeData);
    const { container } = render(<TeamCapacityCard absenceAnalysisRef={{} as any} />);

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("circle").length).toBeGreaterThanOrEqual(2);
  });

  it("handles zero team members gracefully", () => {
    vi.mocked(useFragment).mockReturnValue({
      ...mockAnalyzeData,
      totalTeamMembers: 0,
      availablePercentage: 0,
    });
    render(<TeamCapacityCard absenceAnalysisRef={{} as any} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders null when no data is provided", () => {
    vi.mocked(useFragment).mockReturnValue(null);
    const { container } = render(<TeamCapacityCard absenceAnalysisRef={null} />);
    expect(container.firstChild).toBeNull();
  });
});
