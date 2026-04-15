import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApprovalHeader } from "./ApprovalHeader";
import { useFragment } from "@/__generated__";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("ApprovalHeader", () => {
  const mockRequest = {
    id: "req-123",
    status: "PENDING",
    employee: {
      fullName: "Alexander Thorne",
      jobTitle: {
        name: "Senior Software Engineer",
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFragment as any).mockReturnValue(mockRequest);
  });

  it("renders correctly with employee info and status", () => {
    render(<ApprovalHeader requestRef={{} as any} />);

    expect(screen.getByText("Alexander Thorne")).toBeInTheDocument();
    expect(screen.getByText(/Senior Software Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/status_PENDING/i)).toBeInTheDocument();
  });
});
