import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApprovalActionCard } from "./ApprovalActionCard";

const mockApproveMutation = vi.fn();
const mockRejectMutation = vi.fn();
let mutationCallIndex = 0;

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@apollo/client/react", () => ({
  useMutation: () => {
    // useMutation is called twice in order: approve first, reject second
    const fn = mutationCallIndex++ % 2 === 0 ? mockApproveMutation : mockRejectMutation;
    return [fn, { loading: false }];
  },
}));

vi.mock("@/__generated__", () => ({
  graphql: (s: TemplateStringsArray) => s[0],
}));

describe("ApprovalActionCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationCallIndex = 0;
    mockApproveMutation.mockResolvedValue({ data: {} });
    mockRejectMutation.mockResolvedValue({ data: {} });
  });

  it("renders comment textarea and action buttons", () => {
    render(<ApprovalActionCard requestId="req-123" status="PENDING" />);

    expect(screen.getByPlaceholderText("commentPlaceholder")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "reject" })).toBeInTheDocument();
  });

  it("calls approve mutation with comment", async () => {
    render(<ApprovalActionCard requestId="req-123" status="PENDING" />);

    fireEvent.change(screen.getByPlaceholderText("commentPlaceholder"), {
      target: { value: "Looks good" },
    });
    fireEvent.click(screen.getByRole("button", { name: "approve" }));

    await waitFor(() => {
      expect(mockApproveMutation).toHaveBeenCalledWith({
        variables: {
          input: { requestId: "req-123", comment: "Looks good" },
        },
      });
    });
  });

  it("calls reject mutation with comment", async () => {
    render(<ApprovalActionCard requestId="req-123" status="PENDING" />);

    fireEvent.change(screen.getByPlaceholderText("commentPlaceholder"), {
      target: { value: "Insufficient docs" },
    });
    fireEvent.click(screen.getByRole("button", { name: "reject" }));

    await waitFor(() => {
      expect(mockRejectMutation).toHaveBeenCalledWith({
        variables: {
          input: { requestId: "req-123", comment: "Insufficient docs" },
        },
      });
    });
  });

  it("disables buttons when status is not PENDING", () => {
    render(<ApprovalActionCard requestId="req-123" status="APPROVED" />);

    expect(screen.getByRole("button", { name: "approve" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "reject" })).toBeDisabled();
  });
});
