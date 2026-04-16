import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApprovalActionCard } from "./ApprovalActionCard";
import { useMutation } from "@apollo/client/react";

const mockApproveMutation = vi.fn();
const mockRejectMutation = vi.fn();
let mutationCallIndex = 0;

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@apollo/client/react", () => ({
  useMutation: vi.fn(() => {
    // useMutation is called twice in order: approve first, reject second
    const fn = mutationCallIndex++ % 2 === 0 ? mockApproveMutation : mockRejectMutation;
    return [fn, { loading: false }];
  }),
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

  it("calls approve mutation with comment after confirmation", async () => {
    render(<ApprovalActionCard requestId="req-123" status="PENDING" />);

    fireEvent.change(screen.getByPlaceholderText("commentPlaceholder"), {
      target: { value: "Looks good" },
    });
    
    // Click initial approve button
    fireEvent.click(screen.getByRole("button", { name: "approve" }));

    // Click confirm button in modal
    const confirmBtn = screen.getByRole("button", { name: "confirmApprove" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockApproveMutation).toHaveBeenCalledWith({
        variables: {
          input: { requestId: "req-123", comment: "Looks good" },
        },
      });
    });
  });

  it("calls reject mutation with comment after confirmation", async () => {
    render(<ApprovalActionCard requestId="req-123" status="PENDING" />);

    fireEvent.change(screen.getByPlaceholderText("commentPlaceholder"), {
      target: { value: "Insufficient docs" },
    });

    // Click initial reject button
    fireEvent.click(screen.getByRole("button", { name: "reject" }));

    // Click confirm button in modal
    const confirmBtn = screen.getByRole("button", { name: "confirmReject" });
    fireEvent.click(confirmBtn);

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

  it("disables buttons when mutation is loading", () => {
    // Override the mock for this specific test
    vi.mocked(useMutation).mockReturnValue([vi.fn(), { loading: true }] as any);

    render(<ApprovalActionCard requestId="req-123" status="PENDING" />);

    expect(screen.getByRole("button", { name: "approve" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "reject" })).toBeDisabled();
  });
});
