import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RequestDetailView from "./RequestDetailView";
import { useSuspenseQuery } from "@apollo/client/react";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "req-123" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@apollo/client/react", () => ({
  useSuspenseQuery: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock sub-sections to isolate the view
vi.mock("./RequestOverviewSection", () => ({
  RequestOverviewSection: () => <div data-testid="overview-section" />,
}));
vi.mock("./MedicalDetailsSection", () => ({
  MedicalDetailsSection: () => <div data-testid="medical-section" />,
}));
vi.mock("./ApprovalTimelineSection", () => ({
  ApprovalTimelineSection: () => <div data-testid="timeline-section" />,
}));
vi.mock("./ApproverCard", () => ({
  ApproverCard: () => <div data-testid="approver-card" />,
}));
vi.mock("./AdditionalInfoSection", () => ({
  AdditionalInfoSection: () => <div data-testid="additional-info-section" />,
}));
vi.mock("@/components/requests/CancelRequestModal", () => ({
  CancelRequestModal: ({ isOpen }: { isOpen: boolean }) => 
    isOpen ? <div data-testid="cancel-modal" /> : null,
}));

describe("RequestDetailView", () => {
  const mockRequest = {
    id: "req-123",
    status: "PENDING",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render 404 state when request is not found", () => {
    (useSuspenseQuery as any).mockReturnValue({ data: { request: null } });

    render(<RequestDetailView />);

    expect(screen.getByText("notFound")).toBeInTheDocument();
  });

  it("should render all sections when request is found", () => {
    (useSuspenseQuery as any).mockReturnValue({ data: { request: mockRequest } });

    render(<RequestDetailView />);

    expect(screen.getByText("detailsTitle")).toBeInTheDocument();
    expect(screen.getByTestId("overview-section")).toBeInTheDocument();
    expect(screen.getByTestId("approver-card")).toBeInTheDocument();
    expect(screen.getByTestId("timeline-section")).toBeInTheDocument();
  });

  it("should show cancel button for PENDING status", () => {
    (useSuspenseQuery as any).mockReturnValue({ data: { request: mockRequest } });

    render(<RequestDetailView />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
  });

  it("should hide cancel button for APPROVED status", () => {
    (useSuspenseQuery as any).mockReturnValue({ 
      data: { request: { ...mockRequest, status: "APPROVED" } } 
    });

    render(<RequestDetailView />);

    expect(screen.queryByText("cancel")).not.toBeInTheDocument();
  });

  it("should open cancel modal when cancel button is clicked", () => {
    (useSuspenseQuery as any).mockReturnValue({ data: { request: mockRequest } });

    render(<RequestDetailView />);

    const cancelButton = screen.getByText("cancel");
    fireEvent.click(cancelButton);

    expect(screen.getByTestId("cancel-modal")).toBeInTheDocument();
  });
});
