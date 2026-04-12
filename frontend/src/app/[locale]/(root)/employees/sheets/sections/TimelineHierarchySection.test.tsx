import { render, screen } from "@testing-library/react";
import { TimelineHierarchySection } from "./TimelineHierarchySection";
import { useFragment } from "@/__generated__";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";

// Mock Factory Pattern
const useTranslationsMock = vi.fn(() => (key: string) => key);

const useFragmentMock = vi.fn((_, ref) => ref);

const useServerSideSearchMock = vi.fn(() => ({
  options: [],
  loading: false,
  onSearch: vi.fn(),
  triggerInitialSearch: vi.fn(async () => {}),
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => useTranslationsMock(namespace),
}));

vi.mock("@/__generated__", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useFragment: vi.fn((_, ref) => ref),
  };
});

vi.mock("@/hooks/useServerSideSearch", () => ({
  useServerSideSearch: () => useServerSideSearchMock(),
}));

vi.mock("../hooks/useEmployeeSearch", () => ({ useEmployeeSearch: vi.fn() }));

// Mock Components
vi.mock("@/components/forms", () => ({
  FormDateInput: ({ name, label }: any) => (
    <div data-testid={`date-${name}`}>{label}</div>
  ),
  FormComboboxInput: ({ name, label }: any) => (
    <div data-testid={`combobox-${name}`}>{label}</div>
  ),
  FormSwitch: ({ name, label }: any) => (
    <div data-testid={`switch-${name}`}>{label}</div>
  ),
}));

vi.mock("./FormSection", () => ({
  FormSection: ({ title, children }: any) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

describe("TimelineHierarchySection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders hire date, manager, and status fields with correct labels", () => {
    const employeeRef = { id: "emp-1" };
    useFragmentMock.mockReturnValue({
      manager: { id: "m-1", fullName: "Manager One" },
      hireDate: "2020-01-01",
      isActive: true,
    });

    render(<TimelineHierarchySection employeeRef={employeeRef as any} />);

    expect(screen.getByText("Timeline & Hierarchy")).toBeInTheDocument();
    expect(screen.getByTestId("date-hireDate")).toBeInTheDocument();
    expect(screen.getByTestId("combobox-managerId")).toBeInTheDocument();
    expect(screen.getByTestId("switch-isActive")).toBeInTheDocument();
  });
});
