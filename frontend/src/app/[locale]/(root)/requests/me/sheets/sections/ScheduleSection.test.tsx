import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScheduleSection } from "./ScheduleSection";
import { FormProvider, useForm } from "react-hook-form";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/forms", () => ({
  FormDateInput: ({ label }: any) => <div>{label}</div>,
  FormTextInput: ({ label }: any) => <div>{label}</div>,
}));

vi.mock("@/components/forms/form-input/FormNumberInput", () => ({
  FormNumberInput: ({ label, disabled }: any) => (
    <div data-testid="number-input" data-disabled={disabled}>
      {label}
    </div>
  ),
}));

const Wrapper = ({ children, defaultValues = {} }: { children: React.ReactNode, defaultValues?: any }) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("ScheduleSection", () => {
  it("renders correctly with date and number inputs", () => {
    render(
      <Wrapper>
        <ScheduleSection
          endDate={new Date("2026-05-01")}
          totalUnits={5}
        />
      </Wrapper>
    );

    expect(screen.getByText("startDate")).toBeInTheDocument();
    expect(screen.getByText("requestedDays")).toBeInTheDocument();
  });

  it("displays the calculated end date and total units", () => {
    const endDate = new Date(2026, 4, 1); // May 1, 2026
    render(
      <Wrapper>
        <ScheduleSection
          endDate={endDate}
          totalUnits={5}
        />
      </Wrapper>
    );

    expect(screen.getByText("calculatedEndDate")).toBeInTheDocument();
    expect(screen.getByText(/May 1, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/5 days/i)).toBeInTheDocument();
  });

  it("renders '---' when endDate is null", () => {
    render(
      <Wrapper>
        <ScheduleSection
          endDate={null}
          totalUnits={0}
        />
      </Wrapper>
    );

    expect(screen.getByText("---")).toBeInTheDocument();
  });

  it("disables requestedDays if selectedType has maxDaysPerYear", () => {
    const selectedType = { maxDaysPerYear: 5 };
    render(
      <Wrapper>
        <ScheduleSection
          endDate={new Date()}
          totalUnits={1}
          selectedType={selectedType as any}
        />
      </Wrapper>
    );

    const numberInput = screen.getByTestId("number-input");
    expect(numberInput.getAttribute("data-disabled")).toBe("true");
  });
});
