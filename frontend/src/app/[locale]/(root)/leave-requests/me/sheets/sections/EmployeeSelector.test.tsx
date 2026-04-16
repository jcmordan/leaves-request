import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EmployeeSelector from "./EmployeeSelector";
import { useForm, FormProvider } from "react-hook-form";
import { useServerSideSearch } from "@/hooks/useServerSideSearch";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock hooks
vi.mock("./FormSection", () => ({
  FormSection: ({ children, title }: any) => (
    <div data-testid="form-section">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

vi.mock("@/app/[locale]/(root)/employees/sheets/hooks/useEmployeeSearch", () => ({
  useEmployeeSearch: vi.fn(),
}));

vi.mock("@/hooks/useServerSideSearch", () => ({
  useServerSideSearch: vi.fn(),
}));

vi.mock("@/components/forms", () => ({
  FormComboboxInput: ({ label }: any) => <div data-testid="combobox">{label}</div>,
  FormSwitch: () => <div data-testid="switch" />,
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("EmployeeSelector", () => {
  it("passes search options and loading state to FormComboboxInput", () => {
    const mockOptions = [{ label: "John Doe", value: "1" }];
    (useServerSideSearch as any).mockReturnValue({
      options: mockOptions,
      loading: true,
      onSearch: vi.fn(),
      triggerInitialSearch: vi.fn().mockResolvedValue([]),
    });

    render(
      <Wrapper>
        <EmployeeSelector />
      </Wrapper>
    );

    const combobox = screen.getByTestId("combobox");
    expect(combobox).toBeInTheDocument();
    // Use getByRole or similar to resolve ambiguity between title and label
    expect(screen.getByRole("heading", { name: "employee" })).toBeInTheDocument();
  });
});
