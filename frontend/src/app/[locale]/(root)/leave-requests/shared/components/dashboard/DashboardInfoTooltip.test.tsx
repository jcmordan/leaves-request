import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardInfoTooltip } from "./DashboardInfoTooltip";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("DashboardInfoTooltip", () => {
  it("renders correctly with default variant", () => {
    render(
      <TooltipProvider>
        <DashboardInfoTooltip content="Test help content" />
      </TooltipProvider>
    );

    const button = screen.getByRole("button", { name: /moreInformation/i });
    expect(button).toBeInTheDocument();
    // Default class check (should not be text-on-surface-variant/10)
    expect(button.querySelector("svg")).not.toHaveClass("text-on-surface-variant/10");
  });

  it("renders correctly with subtle variant", () => {
    render(
      <TooltipProvider>
        <DashboardInfoTooltip content="Test help content" variant="subtle" />
      </TooltipProvider>
    );

    const button = screen.getByRole("button", { name: /moreInformation/i });
    expect(button).toBeInTheDocument();
    // Subtle class check
    expect(button.querySelector("svg")).toHaveClass("text-on-surface-variant/10");
  });

  it("applies custom class names", () => {
    render(
      <TooltipProvider>
        <DashboardInfoTooltip 
          content="Test" 
          className="custom-container" 
          iconClassName="custom-icon" 
        />
      </TooltipProvider>
    );

    const button = screen.getByRole("button", { name: /moreInformation/i });
    expect(button).toHaveClass("custom-container");
    expect(button.querySelector("svg")).toHaveClass("custom-icon");
  });
});
