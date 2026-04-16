import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApprovalTimelineCard } from "./ApprovalTimelineCard";
import { useFragment } from "@/__generated__";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "initiatedBy" && params?.name) return `by ${params.name}`;
    return key;
  },
  useFormatter: () => ({
    dateTime: vi.fn((d, options) => new Intl.DateTimeFormat("en-US", options).format(d)),
    number: vi.fn((n) => n.toString()),
  }),
  useLocale: () => "en",
}));

vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: unknown) => s,
}));

vi.mock("@/utils/dateUtils", () => ({
  fullDateTime: (d: Date) => `Full: ${d}`,
  fromNow: (d: Date) => `ago: ${d}`,
}));

describe("ApprovalTimelineCard", () => {
  const mockRequest = {
    createdAt: "2023-10-20T10:45:00Z",
    employee: { fullName: "Alexander Thorne" },
    approvalHistories: [
      {
        id: "ah-1",
        action: "APPROVED",
        comment: "All good",
        actionDate: "2023-10-21T14:00:00Z",
        statusAfterAction: "APPROVED",
        approver: { id: "mgr-1", fullName: "Jane Manager" },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFragment as any).mockReturnValue(mockRequest);
  });

  it("renders the submission step", () => {
    render(<ApprovalTimelineCard requestRef={{} as any} />);

    expect(screen.getByText("submitted")).toBeInTheDocument();
    expect(screen.getByText("by Alexander Thorne")).toBeInTheDocument();
  });

  it("renders approval history entries", () => {
    render(<ApprovalTimelineCard requestRef={{} as any} />);

    expect(screen.getByText("status_APPROVED")).toBeInTheDocument();
    expect(screen.getByText("Jane Manager")).toBeInTheDocument();
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("renders pending placeholder when no history", () => {
    (useFragment as any).mockReturnValue({
      ...mockRequest,
      approvalHistories: [],
    });

    render(<ApprovalTimelineCard requestRef={{} as any} />);

    expect(screen.getByText("status_PENDING")).toBeInTheDocument();
    expect(screen.getByText("pendingDescription")).toBeInTheDocument();
  });
});
