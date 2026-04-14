import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CancelRequestModal } from "./CancelRequestModal";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { useFragment } from "@/__generated__";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const useParamsMock = vi.fn(() => ({ locale: "en" }));
vi.mock("next/navigation", () => ({
  useParams: () => useParamsMock(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@apollo/client/react", () => ({
  useMutation: vi.fn(),
}));

vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
  MY_REQUEST_ITEM_FRAGMENT: {},
  CANCEL_REQUEST_MUTATION: {},
}));

describe("CancelRequestModal", () => {
  const mockRequest = {
    id: "req-123",
    startDate: "2026-05-01T12:00:00",
    endDate: "2026-05-05T12:00:00",
    absenceType: {
      name: "Vacation",
    },
  };

  const cancelRequestMock = vi.fn();
  const onCloseMock = vi.fn();
  const onSuccessMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useFragment as any).mockReturnValue(mockRequest);
    (useMutation as any).mockReturnValue([
      cancelRequestMock,
      { loading: false },
    ]);
  });

  it("renders nothing when request is null", () => {
    (useFragment as any).mockReturnValue(null);
    const { container } = render(
      <CancelRequestModal
        isOpen={true}
        onClose={onCloseMock}
        requestRef={null}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders correctly with request details", () => {
    render(
      <CancelRequestModal
        isOpen={true}
        onClose={vi.fn()}
        requestRef={mockRequest as any}
      />
    );

    expect(screen.getByText("cancelRequestTitle")).toBeInTheDocument();
    expect(screen.getByText(/Vacation/i)).toBeInTheDocument();
    
    // Check for the date range - being more flexible with potential split nodes
    const summaryText = screen.getByText(/Vacation/i).parentElement?.textContent;
    expect(summaryText).toContain("May 1");
    expect(summaryText).toContain("May 5");
  });

  it("calls cancelRequest mutation when confirm button is clicked", () => {
    render(
      <CancelRequestModal
        isOpen={true}
        onClose={onCloseMock}
        requestRef={{} as any}
      />
    );

    fireEvent.click(screen.getByText("confirmCancel"));

    expect(cancelRequestMock).toHaveBeenCalledWith({
      variables: {
        input: {
          requestId: "req-123",
          reason: "Cancelled by employee",
        },
      },
    });
  });

  it("calls onClose when keep request button is clicked", () => {
    render(
      <CancelRequestModal
        isOpen={true}
        onClose={onCloseMock}
        requestRef={{} as any}
      />
    );

    fireEvent.click(screen.getByText("keepRequest"));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("handles successful cancellation", async () => {
    let onCompletedCallback: any;
    (useMutation as any).mockImplementation((_mutation: any, options: any) => {
      onCompletedCallback = options.onCompleted;
      return [cancelRequestMock, { loading: false }];
    });

    render(
      <CancelRequestModal
        isOpen={true}
        onClose={onCloseMock}
        requestRef={{} as any}
        onSuccess={onSuccessMock}
      />
    );

    fireEvent.click(screen.getByText("confirmCancel"));

    // Simulate mutation completion
    onCompletedCallback({ cancelLeaveRequest: true });

    expect(toast.success).toHaveBeenCalledWith("cancelSuccess");
    expect(onSuccessMock).toHaveBeenCalled();
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("handles cancellation error", async () => {
    let onCompletedCallback: any;
    (useMutation as any).mockImplementation((_mutation: any, options: any) => {
      onCompletedCallback = options.onCompleted;
      return [cancelRequestMock, { loading: false }];
    });

    render(
      <CancelRequestModal
        isOpen={true}
        onClose={onCloseMock}
        requestRef={{} as any}
      />
    );

    fireEvent.click(screen.getByText("confirmCancel"));

    // Simulate mutation completion with false result
    onCompletedCallback({ cancelLeaveRequest: false });

    expect(toast.error).toHaveBeenCalledWith("cancelError");
  });

  it("handles mutation error (onError branch)", async () => {
    let onErrorCallback: any;
    (useMutation as any).mockImplementation((_mutation: any, options: any) => {
      onErrorCallback = options.onError;
      return [cancelRequestMock, { loading: false }];
    });

    render(
      <CancelRequestModal
        isOpen={true}
        onClose={onCloseMock}
        requestRef={{} as any}
      />
    );

    fireEvent.click(screen.getByText("confirmCancel"));

    // Simulate mutation error
    onErrorCallback(new Error("GraphQL error"));

    expect(toast.error).toHaveBeenCalledWith("cancelError");
  });

  it("handles successful cancellation without onSuccess callback", async () => {
    let onCompletedCallback: any;
    (useMutation as any).mockImplementation((_mutation: any, options: any) => {
      onCompletedCallback = options.onCompleted;
      return [cancelRequestMock, { loading: false }];
    });

    render(
      <CancelRequestModal
        isOpen={true}
        onClose={onCloseMock}
        requestRef={{} as any}
      />
    );

    fireEvent.click(screen.getByText("confirmCancel"));
    onCompletedCallback({ cancelLeaveRequest: true });

    expect(onCloseMock).toHaveBeenCalled();
    // No error if onSuccess is missing
  });

  it("renders correctly with Spanish locale", () => {
    useParamsMock.mockReturnValue({ locale: "es" });
    render(
      <CancelRequestModal
        isOpen={true}
        onClose={vi.fn()}
        requestRef={mockRequest as any}
      />
    );

    expect(screen.getByText(/Vacation/i)).toBeInTheDocument();
  });

  it("disables buttons when loading is true", () => {
    (useMutation as any).mockReturnValue([cancelRequestMock, { loading: true }]);

    render(
      <CancelRequestModal
        isOpen={true}
        onClose={onCloseMock}
        requestRef={mockRequest as any}
      />
    );

    expect(screen.getByText("cancelling")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelling/i })).toBeDisabled();
    expect(screen.getByText("keepRequest").closest("button")).toBeDisabled();
  });
});
