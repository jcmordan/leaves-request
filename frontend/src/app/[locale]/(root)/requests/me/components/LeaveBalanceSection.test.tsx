import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LeaveBalanceSection } from "./LeaveBalanceSection";
import { useFragment } from "@/__generated__";
import { useSheets } from "@/components/layout/sheets/SheetNavigation";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" }),
}));

// Mock @/__generated__
vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: string) => s,
}));

// Mock useSheets
const openSheetMock = vi.fn();
vi.mock("@/components/layout/sheets/SheetNavigation", () => ({
  useSheets: vi.fn(() => ({
    openSheet: openSheetMock,
  })),
}));

describe("LeaveBalanceSection", () => {
  const mockBalance = {
    totalEntitlement: 20,
    taken: 5,
    remaining: 15,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders balance information correctly", () => {
    (useFragment as any).mockReturnValue(mockBalance);

    render(<LeaveBalanceSection balanceRef={{} as any} />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`leaveBalance ${currentYear}`)).toBeInTheDocument();
    expect(screen.getByText("5 / 20 days")).toBeInTheDocument();
    expect(screen.getByText("05")).toBeInTheDocument(); // taken
    expect(screen.getByText("15")).toBeInTheDocument(); // remaining
  });

  it("triggers openSheet when new request button is clicked", () => {
    (useFragment as any).mockReturnValue(mockBalance);

    render(<LeaveBalanceSection balanceRef={{} as any} />);

    const button = screen.getByRole("button", { name: /newRequest/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(openSheetMock).toHaveBeenCalledWith(
      "SubmitAbsentRequestSheet",
      {},
      { width: "lg" },
    );
  });
});

