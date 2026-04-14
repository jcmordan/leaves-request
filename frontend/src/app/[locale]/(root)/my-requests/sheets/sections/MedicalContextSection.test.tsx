import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MedicalContextSection } from "./MedicalContextSection";
import { FormProvider, useForm } from "react-hook-form";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/forms", () => ({
  FormTextInput: ({ label }: any) => <div data-testid="text-input">{label}</div>,
  FormFileInput: ({ label }: any) => <div data-testid="file-input">{label}</div>,
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("MedicalContextSection", () => {
  it("renders correctly with medical details", () => {
    render(
      <Wrapper>
        <MedicalContextSection />
      </Wrapper>
    );

    expect(screen.getByText("medicalLeaveDetails")).toBeInTheDocument();
    expect(screen.getByText("medicalEvidence")).toBeInTheDocument();
    expect(screen.getByText("diagnosis")).toBeInTheDocument();
    expect(screen.getByText("treatingDoctor")).toBeInTheDocument();
    expect(screen.getByText("medicalCertificate")).toBeInTheDocument();
  });
});
