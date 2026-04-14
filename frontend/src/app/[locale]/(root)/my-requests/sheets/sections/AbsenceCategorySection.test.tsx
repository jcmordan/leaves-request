import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AbsenceCategorySection } from "./AbsenceCategorySection";
import { FormProvider, useForm } from "react-hook-form";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/forms", () => ({
  FormComboboxInput: ({ label, name, disabled, options }: any) => (
    <div data-testid={`combobox-${name}`} data-disabled={disabled}>
      <label>{label}</label>
      <select 
        data-testid={`select-${name}`}
        onChange={(e) => {
          // This is a simplification of what FormComboboxInput does
        }}
      >
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  ),
}));

const Wrapper = ({ children, defaultValues = {} }: { children: React.ReactNode, defaultValues?: any }) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("AbsenceCategorySection", () => {
  const mockAbsenceTypes = [
    { value: "1", label: "Vacation" },
    { value: "2", label: "Medical" },
  ];
  const mockSubTypes = [
    { value: "sub-1", label: "Sub 1" },
  ];

  it("renders both comboboxes", () => {
    render(
      <Wrapper>
        <AbsenceCategorySection
          absenceTypes={mockAbsenceTypes}
          subTypes={mockSubTypes}
        />
      </Wrapper>
    );

    expect(screen.getByText("absenceType")).toBeInTheDocument();
    expect(screen.getByText("absenceSubtype")).toBeInTheDocument();
  });

  it("disables sub-type when no absence type is selected", () => {
    render(
      <Wrapper defaultValues={{ absenceTypeId: null }}>
        <AbsenceCategorySection
          absenceTypes={mockAbsenceTypes}
          subTypes={mockSubTypes}
        />
      </Wrapper>
    );

    const subTypeCombobox = screen.getByTestId("combobox-absenceSubTypeId");
    expect(subTypeCombobox.getAttribute("data-disabled")).toBe("true");
  });

  it("disables sub-type when subTypes array is empty", () => {
    render(
      <Wrapper defaultValues={{ absenceTypeId: "1" }}>
        <AbsenceCategorySection
          absenceTypes={mockAbsenceTypes}
          subTypes={[]}
        />
      </Wrapper>
    );

    const subTypeCombobox = screen.getByTestId("combobox-absenceSubTypeId");
    expect(subTypeCombobox.getAttribute("data-disabled")).toBe("true");
  });

  it("enables sub-type when absence type is selected and subTypes are available", () => {
    render(
      <Wrapper defaultValues={{ absenceTypeId: "1" }}>
        <AbsenceCategorySection
          absenceTypes={mockAbsenceTypes}
          subTypes={mockSubTypes}
        />
      </Wrapper>
    );

    const subTypeCombobox = screen.getByTestId("combobox-absenceSubTypeId");
    expect(subTypeCombobox.getAttribute("data-disabled")).toBe("false");
  });
});
