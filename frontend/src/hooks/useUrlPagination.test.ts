import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useUrlPagination } from "./useUrlPagination";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/employees",
  useSearchParams: () => new URLSearchParams(),
}));

describe("useUrlPagination", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("returns pagination state", () => {
    const { result } = renderHook(() =>
      useUrlPagination({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: "a",
        endCursor: "b",
      }),
    );

    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it("handleNextPage pushes with after cursor", () => {
    const { result } = renderHook(() =>
      useUrlPagination({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: "a",
        endCursor: "cursor-next",
      }),
    );

    act(() => result.current.handleNextPage());
    expect(mockPush).toHaveBeenCalledWith("/employees?after=cursor-next");
  });

  it("handleNextPage does nothing when no next page", () => {
    const { result } = renderHook(() =>
      useUrlPagination({
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: "a",
        endCursor: "b",
      }),
    );

    act(() => result.current.handleNextPage());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("handlePreviousPage pushes with before cursor", () => {
    const { result } = renderHook(() =>
      useUrlPagination({
        hasNextPage: false,
        hasPreviousPage: true,
        startCursor: "cursor-prev",
        endCursor: "b",
      }),
    );

    act(() => result.current.handlePreviousPage());
    expect(mockPush).toHaveBeenCalledWith("/employees?before=cursor-prev");
  });

  it("handlePreviousPage does nothing when no previous page", () => {
    const { result } = renderHook(() =>
      useUrlPagination({
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: "a",
        endCursor: "b",
      }),
    );

    act(() => result.current.handlePreviousPage());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("setFilter adds filter param and resets cursors", () => {
    const { result } = renderHook(() => useUrlPagination(null));

    act(() => result.current.setFilter("status", "active"));
    expect(mockPush).toHaveBeenCalledWith("/employees?status=active");
  });

  it("setFilter removes param when value is null", () => {
    const { result } = renderHook(() => useUrlPagination(null));

    act(() => result.current.setFilter("status", null));
    expect(mockPush).toHaveBeenCalledWith("/employees");
  });

  it("setFilter removes param when value is empty string", () => {
    const { result } = renderHook(() => useUrlPagination(null));

    act(() => result.current.setFilter("status", ""));
    expect(mockPush).toHaveBeenCalledWith("/employees");
  });

  it("clearFilters removes specified keys", () => {
    const { result } = renderHook(() => useUrlPagination(null));

    act(() => result.current.clearFilters(["status", "department"]));
    expect(mockPush).toHaveBeenCalledWith("/employees");
  });

  it("returns false for both pagination flags with null pageInfo", () => {
    const { result } = renderHook(() => useUrlPagination(null));
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(false);
  });
});
