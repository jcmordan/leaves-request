import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TeamCapacityCard } from "./TeamCapacityCard";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      teamCapacity: "Team Capacity",
      available: "Available",
      capacityPercentage: "{percentage}%",
    };
    const template = translations[key] || key;
    if (!params) return template;
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
      template,
    );
  },
}));

describe("TeamCapacityCard", () => {
  it("renders capacity percentage", () => {
    render(<TeamCapacityCard />);

    expect(screen.getByText("Team Capacity")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("renders the SVG circular progress", () => {
    const { container } = render(<TeamCapacityCard />);

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("circle").length).toBeGreaterThanOrEqual(2);
  });
});
