import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdditionalInfoSection } from "./AdditionalInfoSection";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock GraphQL fragments
vi.mock("@/__generated__", () => ({
  useFragment: (_fragment: any, data: any) => data,
  graphql: (s: any) => s,
}));

const mockRequest = {
  id: "1",
  reason: "Seasonal flu and needs rest.",
};

describe("AdditionalInfoSection", () => {
  it("should render with provided request reason", () => {
    render(<AdditionalInfoSection requestRef={mockRequest as any} />);

    expect(screen.getByText("additionalInfoTitle")).toBeInTheDocument();
    expect(screen.getByText("employeeComment")).toBeInTheDocument();
    expect(screen.getByText("Seasonal flu and needs rest.")).toBeInTheDocument();
  });

  it("should render even with an empty reason", () => {
    const emptyRequest = { ...mockRequest, reason: "" };
    render(<AdditionalInfoSection requestRef={emptyRequest as any} />);

    expect(screen.getByText("additionalInfoTitle")).toBeInTheDocument();
    // The component still renders the section but the reason text will be empty
  });
});
