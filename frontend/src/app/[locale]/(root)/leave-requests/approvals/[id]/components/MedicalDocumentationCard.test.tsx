import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MedicalDocumentationCard } from "./MedicalDocumentationCard";
import { useFragment } from "@/__generated__";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    dateTime: vi.fn((d, options) => new Intl.DateTimeFormat("en-US", options).format(d)),
    number: vi.fn((n) => n.toString()),
  }),
}));

vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
}));

describe("MedicalDocumentationCard", () => {
  const mockRequest = {
    diagnosis: "Influenza",
    treatingDoctor: "Dr. Jenkins",
    attachments: [
      {
        id: "att-1",
        fileName: "Certificate.pdf",
        fileSize: 1024,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFragment as any).mockReturnValue(mockRequest);
  });

  it("renders medical data correctly", () => {
    render(<MedicalDocumentationCard requestRef={{} as any} />);

    expect(screen.getByText("Influenza")).toBeInTheDocument();
    expect(screen.getByText("Dr. Jenkins")).toBeInTheDocument();
    expect(screen.getByText("Certificate.pdf")).toBeInTheDocument();
  });

  it("renders null when no medical data provided", () => {
    (useFragment as any).mockReturnValue({
      diagnosis: null,
      treatingDoctor: null,
      attachments: [],
    });

    const { container } = render(
      <MedicalDocumentationCard requestRef={{} as any} />
    );

    expect(container.firstChild).toBeNull();
  });
});
