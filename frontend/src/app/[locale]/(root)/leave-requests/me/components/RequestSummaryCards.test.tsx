import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RequestSummaryCards } from "./RequestSummaryCards";
import { RequestStatus } from "@/__generated__/graphql";
import { useFragment } from "@/__generated__";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useParams: () => ({
    locale: "en",
  }),
}));

// Mock @/__generated__
vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: string) => s,
}));

describe("RequestSummaryCards", () => {
  it("renders all summary cards with correct counts", () => {
    const mockBalance = {
      pendingRequests: 1,
      approvedRequests: 2,
      rejectedRequests: 1,
      cancelledRequests: 1,
    };
    (useFragment as any).mockReturnValue(mockBalance);

    render(<RequestSummaryCards myBalanceRef={{} as any} />);

    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("approved")).toBeInTheDocument();
    expect(screen.getByText("rejected")).toBeInTheDocument();
    expect(screen.getByText("cancelled")).toBeInTheDocument();

    // Check we have three "01" (Pending, Rejected, Cancelled) and one "02" (Approved)
    expect(screen.getAllByText("01")).toHaveLength(3);
    expect(screen.getByText("02")).toBeInTheDocument();
  });

  it("handles zero counts", () => {
    const mockBalance = {
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      cancelledRequests: 0,
    };
    (useFragment as any).mockReturnValue(mockBalance);

    render(<RequestSummaryCards myBalanceRef={{} as any} />);

    const zeros = screen.getAllByText("00");
    expect(zeros).toHaveLength(4);
  });
});
