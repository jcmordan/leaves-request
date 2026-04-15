import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ApprovalView from "./ApprovalView";
import { useParams } from "next/navigation";
import { useSuspenseQuery } from "@apollo/client/react";
import { RequestStatus } from "@/__generated__/graphql";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));

vi.mock("@apollo/client/react", () => ({
  useSuspenseQuery: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock sub-components
vi.mock("./ApprovalHeader", () => ({
  ApprovalHeader: () => <div data-testid="approval-header" />,
}));
vi.mock("./RequestSummaryCard", () => ({
  RequestSummaryCard: () => <div data-testid="summary-card" />,
}));
vi.mock("./MedicalDocumentationCard", () => ({
  MedicalDocumentationCard: () => <div data-testid="medical-card" />,
}));
vi.mock("./ApprovalActionCard", () => ({
  ApprovalActionCard: () => <div data-testid="action-card" />,
}));
vi.mock("./OverlapAlertCard", () => ({
  OverlapAlertCard: () => <div data-testid="overlap-card" />,
}));
vi.mock("./TeamCapacityCard", () => ({
  TeamCapacityCard: () => <div data-testid="capacity-card" />,
}));
vi.mock("./ApprovalTimelineCard", () => ({
  ApprovalTimelineCard: () => <div data-testid="timeline-card" />,
}));
vi.mock("./RequesterCommentsCard", () => ({
  RequesterCommentsCard: () => <div data-testid="comments-card" />,
}));

describe("ApprovalView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as any).mockReturnValue({ id: "123" });
  });

  const mockData = {
    request: {
      id: "123",
      status: RequestStatus.Pending,
    },
    absenceAnalysis: {
      id: "analysis-1",
    },
  };

  it("renders all components when data is present", () => {
    (useSuspenseQuery as any).mockReturnValue({ data: mockData });

    render(<ApprovalView />);

    expect(screen.getByTestId("approval-header")).toBeInTheDocument();
    expect(screen.getByTestId("summary-card")).toBeInTheDocument();
    expect(screen.getByTestId("medical-card")).toBeInTheDocument();
    expect(screen.getByTestId("comments-card")).toBeInTheDocument();
    expect(screen.getByTestId("action-card")).toBeInTheDocument();
    expect(screen.getByTestId("overlap-card")).toBeInTheDocument();
    expect(screen.getByTestId("capacity-card")).toBeInTheDocument();
    expect(screen.getByTestId("timeline-card")).toBeInTheDocument();
  });

  it("renders not found state when request is missing", () => {
    (useSuspenseQuery as any).mockReturnValue({ data: { request: null } });

    render(<ApprovalView />);

    expect(screen.getByText("notFound")).toBeInTheDocument();
    expect(screen.queryByTestId("approval-header")).not.toBeInTheDocument();
  });

  it("does not render action card when status is not pending", () => {
    (useSuspenseQuery as any).mockReturnValue({
      data: {
        ...mockData,
        request: { ...mockData.request, status: RequestStatus.Approved },
      },
    });

    render(<ApprovalView />);

    expect(screen.queryByTestId("action-card")).not.toBeInTheDocument();
  });

  it("does not render analysis cards when analysis is missing", () => {
    (useSuspenseQuery as any).mockReturnValue({
      data: {
        ...mockData,
        absenceAnalysis: null,
      },
    });

    render(<ApprovalView />);

    expect(screen.queryByTestId("overlap-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("capacity-card")).not.toBeInTheDocument();
  });
});
