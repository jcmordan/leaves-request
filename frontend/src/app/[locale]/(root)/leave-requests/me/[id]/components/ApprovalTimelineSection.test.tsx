import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApprovalTimelineSection } from "./ApprovalTimelineSection";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (id: string, params?: any) => {
    if (params?.name) return `${id} ${params.name}`;
    return id;
  },
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
  status: "PENDING",
  reason: "Sick",
  diagnosis: null,
  treatingDoctor: null,
  createdAt: "2024-10-23T09:15:00Z",
  absenceType: { id: "t1", name: "Sick Leave" },
  employee: { id: "e1", fullName: "Alexander Thorne" },
  requesterEmployee: { id: "e1", fullName: "Alexander Thorne" },
  attachments: [],
  approvalHistories: [],
};

describe("ApprovalTimelineSection", () => {
  it("should always display the submission step", () => {
    render(<ApprovalTimelineSection requestRef={baseRequest as any} />);

    expect(screen.getByText("submitted")).toBeInTheDocument();
  });

  it("should display submission date from createdAt", () => {
    render(<ApprovalTimelineSection requestRef={baseRequest as any} />);

    expect(screen.getByText(/Oct 23, 2024/)).toBeInTheDocument();
  });

  it("should display the requester employee name", () => {
    render(<ApprovalTimelineSection requestRef={baseRequest as any} />);

    expect(screen.getByText(/Alexander Thorne/)).toBeInTheDocument();
  });

  it("should render approval history entries", () => {
    const request = {
      ...baseRequest,
      approvalHistories: [
        {
          id: "h1",
          action: "APPROVED",
          comment: "Looks good",
          actionDate: "2024-10-23T11:40:00Z",
          statusAfterAction: "APPROVED",
          approver: { id: "m1", fullName: "Roberto Mendez" },
        },
      ],
    };

    render(<ApprovalTimelineSection requestRef={request as any} />);

    expect(screen.getByText("Roberto Mendez")).toBeInTheDocument();
    expect(screen.getByText("Looks good")).toBeInTheDocument();
    expect(screen.getByText("status_APPROVED")).toBeInTheDocument();
  });

  it("should display Pending status when no histories are present", () => {
    render(<ApprovalTimelineSection requestRef={baseRequest as any} />);

    expect(screen.getByText("status_PENDING")).toBeInTheDocument();
  });
});
