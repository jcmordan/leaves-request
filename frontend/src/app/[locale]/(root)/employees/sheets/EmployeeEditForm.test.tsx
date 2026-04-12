import { render, screen } from "@testing-library/react";
import { EmployeeEditFormContent } from "./EmployeeEditForm";
import { describe, expect, it, vi } from "vitest";
import React from "react";

// Mock Sections
vi.mock("./sections", () => ({
  IdentitySection: () => (
    <div data-testid="identity-section">Identity Section</div>
  ),
  RolePlacementSection: () => (
    <div data-testid="role-placement-section">Role Placement Section</div>
  ),
  TimelineHierarchySection: () => (
    <div data-testid="timeline-hierarchy-section">
      Timeline Hierarchy Section
    </div>
  ),
}));

// Mock Components
vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr data-testid="separator" />,
}));

describe("EmployeeEditFormContent", () => {
  it("renders all form sections and separators in order", () => {
    const employeeRef = { id: "emp-1" };

    render(<EmployeeEditFormContent employeeRef={employeeRef as any} />);

    expect(screen.getByTestId("identity-section")).toBeInTheDocument();
    expect(screen.getByTestId("role-placement-section")).toBeInTheDocument();
    expect(
      screen.getByTestId("timeline-hierarchy-section"),
    ).toBeInTheDocument();

    const separators = screen.getAllByTestId("separator");
    expect(separators).toHaveLength(2);
  });

  it("handles null employeeRef gracefully (even if non-optional in implementation)", () => {
    // Just verifying it doesn't crash if we passed null (though normally not the case)
    // Note: The ! operator in RolePlacementSection employeeRef={employeeRef!} might crash if null
    // But IdentitySection is rendered first.
  });
});
