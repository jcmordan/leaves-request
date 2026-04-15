import { render, screen } from "@testing-library/react";
import { RequesterCommentsCard } from "./RequesterCommentsCard";
import { useTranslations } from "next-intl";
import { useFragment } from "@/__generated__";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
}));

describe("RequesterCommentsCard", () => {
  const tMock = vi.fn((key: string) => key);

  beforeEach(() => {
    vi.mocked(useTranslations).mockReturnValue(tMock);
  });

  it("should render null if no request or reason", () => {
    vi.mocked(useFragment).mockReturnValue(null);
    const { container } = render(<RequesterCommentsCard requestRef={{} as any} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render null if reason is empty", () => {
    vi.mocked(useFragment).mockReturnValue({ reason: "" });
    const { container } = render(<RequesterCommentsCard requestRef={{} as any} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render the requester comment when provide", () => {
    const mockReason = "I need a vacation to rest.";
    vi.mocked(useFragment).mockReturnValue({ reason: mockReason });

    render(<RequesterCommentsCard requestRef={{} as any} />);

    expect(screen.getByText("employeeComment")).toBeInTheDocument();
    expect(screen.getByText(mockReason)).toBeInTheDocument();
  });
});
