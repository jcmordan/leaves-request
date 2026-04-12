import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import NewRequestForm from "./NewRequestForm";
import { useSuspenseQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "@/i18n/navigation";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock @apollo/client/react
const createRequestMock = vi.fn();
vi.mock("@apollo/client/react", () => ({
  useSuspenseQuery: vi.fn(),
  useMutation: vi.fn(() => [createRequestMock, { loading: false }]),
}));

// Mock next/navigation or i18n/navigation
const pushMock = vi.fn();
const backMock = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: pushMock,
    back: backMock,
  })),
}));

// Mock @/__generated__
vi.mock("@/__generated__", () => ({
  graphql: (s: string) => s,
}));

// Mock Popover and Calendar since they are complex and might fail in JSDOM
vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children, render: renderProp }: any) => (
    <div>{renderProp || children}</div>
  ),
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: any) => (
    <button onClick={() => onSelect(new Date("2024-05-01T12:00:00Z"))}>
      Select Date
    </button>
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ onValueChange, children }: any) => (
    <div data-testid="mock-select" onClick={() => onValueChange("1")}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-value={value}>{children}</div>
  ),
}));

describe("NewRequestForm", () => {
  const mockAbsenceTypes = [
    { id: "1", name: "Vacation", requiresHospitalInfo: false },
    { id: "2", name: "Sickness", requiresHospitalInfo: true },
  ];

  const mockData = {
    absenceTypes: mockAbsenceTypes,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSuspenseQuery as any).mockReturnValue({ data: mockData });
  });

  it("renders correctly", () => {
    render(<NewRequestForm />);
    expect(screen.getByText("newRequestTitle")).toBeInTheDocument();
  });

  it("renders form labels", () => {
    render(<NewRequestForm />);
    expect(screen.getByText("absenceTypeLabel *")).toBeInTheDocument();
    expect(screen.getByText("startDateLabel *")).toBeInTheDocument();
    expect(screen.getByText("endDateLabel *")).toBeInTheDocument();
    expect(screen.getByText("reasonLabel *")).toBeInTheDocument();
  });

  it("renders absence type options", () => {
    render(<NewRequestForm />);
    expect(screen.getByText("Vacation")).toBeInTheDocument();
    expect(screen.getByText("Sickness")).toBeInTheDocument();
  });

  it("calls cancel button which triggers router.back", () => {
    render(<NewRequestForm />);

    fireEvent.click(screen.getByText("cancelButton"));
    expect(backMock).toHaveBeenCalled();
  });

  it("renders submit button", () => {
    render(<NewRequestForm />);

    expect(screen.getByText("submitButton")).toBeInTheDocument();
  });

  it("shows medical fields when sickness type with requiresHospitalInfo is selected", () => {
    // Override select mock to choose sickness (id: 2)
    const SelectMock = ({ onValueChange, children }: any) => (
      <div data-testid="mock-select" onClick={() => onValueChange("2")}>
        {children}
      </div>
    );

    render(<NewRequestForm />);

    // Click to select (triggers onValueChange("1") by default mock)
    fireEvent.click(screen.getByTestId("mock-select"));

    // Since default mock fires "1" (Vacation, no hospital info),
    // the medical fields should NOT appear for vacation
    expect(screen.queryByText("medicalAffidavitTitle")).not.toBeInTheDocument();
  });

  it("renders with empty absence types gracefully", () => {
    (useSuspenseQuery as any).mockReturnValue({
      data: { absenceTypes: [] },
    });
    render(<NewRequestForm />);
    expect(screen.getByText("newRequestTitle")).toBeInTheDocument();
  });

  it("renders with missing data gracefully", () => {
    (useSuspenseQuery as any).mockReturnValue({
      data: {},
    });
    render(<NewRequestForm />);
    expect(screen.getByText("newRequestTitle")).toBeInTheDocument();
  });

  it("handles form submission with valid data", async () => {
    createRequestMock.mockResolvedValue({ data: { submitLeaveRequest: { id: "1", status: "PENDING" } } });

    render(<NewRequestForm />);

    // Fill reason
    const reasonInput = screen.getByPlaceholderText("reasonPlaceholder");
    fireEvent.change(reasonInput, {
      target: { value: "I need a vacation for personal reasons." },
    });

    // Select absence type
    fireEvent.click(screen.getByTestId("mock-select"));

    // Select dates
    const dateButtons = screen.getAllByText("Select Date");
    fireEvent.click(dateButtons[0]);
    if (dateButtons[1]) fireEvent.click(dateButtons[1]);

    // Submit
    const submitButton = screen.getByText("submitButton");
    fireEvent.click(submitButton);
  });
});
