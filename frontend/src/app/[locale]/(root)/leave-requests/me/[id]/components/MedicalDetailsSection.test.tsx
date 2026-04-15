import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MedicalDetailsSection } from "./MedicalDetailsSection";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock GraphQL fragments
vi.mock("@/__generated__", () => ({
  useFragment: (_fragment: any, data: any) => data,
  graphql: (s: any) => s,
}));

const baseRequest = {
  id: "1",
  startDate: "2024-10-24T00:00:00Z",
  endDate: "2024-10-26T00:00:00Z",
  totalDaysRequested: 3,
  status: "PENDING" as const,
  reason: "Seasonal flu",
  diagnosis: null,
  treatingDoctor: null,
  createdAt: "2024-10-23T09:00:00Z",
  absenceType: { id: "t1", name: "Sick Leave" },
  employee: { id: "e1", fullName: "Alexander Thorne" },
  requesterEmployee: { id: "e1", fullName: "Alexander Thorne" },
  attachments: [],
  approvalHistories: [],
};

describe("MedicalDetailsSection", () => {
  it("should return null when no medical data is provided", () => {
    const { container } = render(<MedicalDetailsSection requestRef={baseRequest as any} />);

    expect(container.firstChild).toBeNull();
  });

  it("should display diagnosis when provided", () => {
    const request = {
      ...baseRequest,
      diagnosis: "Seasonal viral infection",
    };

    render(<MedicalDetailsSection requestRef={request as any} />);

    expect(screen.getByText("Seasonal viral infection")).toBeInTheDocument();
  });

  it("should display treating doctor when provided", () => {
    const request = {
      ...baseRequest,
      treatingDoctor: "Dr. Elena Vaisey, MD",
    };

    render(<MedicalDetailsSection requestRef={request as any} />);

    expect(screen.getByText(/Dr. Elena Vaisey, MD/)).toBeInTheDocument();
  });

  it("should display attachments when provided", () => {
    const request = {
      ...baseRequest,
      attachments: [
        {
          id: "a1",
          fileName: "Medical_Certificate.pdf",
          fileSize: 1258291,
          uploadedAt: "2024-10-23T09:00:00Z",
        },
      ],
    };

    render(<MedicalDetailsSection requestRef={request as any} />);

    expect(screen.getByText("Medical_Certificate.pdf")).toBeInTheDocument();
  });
});
