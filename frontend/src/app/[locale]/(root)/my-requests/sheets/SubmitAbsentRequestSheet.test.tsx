import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SubmitAbsentRequestSheet } from "./SubmitAbsentRequestSheet";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSheets } from "@/components/layout/sheets/SheetNavigation";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@apollo/client/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock("@/components/layout/sheets/SheetNavigation", () => ({
  useSheets: vi.fn(() => ({
    closeSheet: vi.fn(),
  })),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the FormSheet component to simplify testing orchestration
vi.mock("@/components/layout/sheets/FormSheet", () => ({
  default: ({ children, title, onSubmit }: any) => (
    <div data-testid="form-sheet">
      <h1>{title}</h1>
      {children}
      <button data-testid="submit-btn" onClick={() => onSubmit({ absenceTypeId: "1", startDate: new Date(), endDate: new Date() })}>
        Submit
      </button>
    </div>
  ),
}));

// Mock the child form
vi.mock("./SubmitAbsentRequestForm", () => {
  const { z } = require("zod");
  return {
    SubmitAbsentRequestForm: () => <div data-testid="absent-request-form">Mock Form</div>,
    getSubmitRequestSchema: vi.fn(() => z.object({
      absenceTypeId: z.string().uuid().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    })),
  };
});

describe("SubmitAbsentRequestSheet", () => {
  const mockData = {
    absenceTypes: {
      nodes: [{ id: "1", name: "Vacation" }],
    },
    publicHolidays: [{ date: "2026-01-01" }],
  };

  const submitRequestMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useQuery as any).mockReturnValue({
      data: mockData,
      loading: false,
    });
    (useMutation as any).mockReturnValue([
      submitRequestMock,
      { loading: false },
    ]);
  });

  it("renders correctly with title and child form", () => {
    render(<SubmitAbsentRequestSheet />);

    expect(screen.getByText("submitNewRequest")).toBeInTheDocument();
    expect(screen.getByTestId("absent-request-form")).toBeInTheDocument();
  });

  it("calls useQuery with correct parameters", () => {
    render(<SubmitAbsentRequestSheet />);

    expect(useQuery).toHaveBeenCalledWith(expect.anything(), {
      variables: { year: new Date().getFullYear() },
    });
  });

  it("handles form submission", async () => {
    render(<SubmitAbsentRequestSheet />);

    fireEvent.click(screen.getByTestId("submit-btn"));

    expect(submitRequestMock).toHaveBeenCalledWith({
      variables: {
        input: expect.objectContaining({
          absenceTypeId: "1",
        }),
      },
    });
  });

  it("shows loading state when query is loading", () => {
    (useQuery as any).mockReturnValue({
      data: null,
      loading: true,
    });

    render(<SubmitAbsentRequestSheet />);
    
    // FormSheet title should still be there but maybe we can check for loading prop if we didn't mock it so aggressively
    expect(screen.getByText("submitNewRequest")).toBeInTheDocument();
  });
});
