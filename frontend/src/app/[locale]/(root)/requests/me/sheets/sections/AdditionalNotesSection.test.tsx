import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdditionalNotesSection } from "./AdditionalNotesSection";
import { FormProvider, useForm } from "react-hook-form";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/forms", () => ({
  FormTextArea: ({ label }: any) => <div data-testid="text-area">{label}</div>,
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("AdditionalNotesSection", () => {
  it("renders correctly", () => {
    render(
      <Wrapper>
        <AdditionalNotesSection />
      </Wrapper>
    );

    expect(screen.getByText("additionalDetails")).toBeInTheDocument();
    expect(screen.getByText("additionalComments")).toBeInTheDocument();
  });
});
