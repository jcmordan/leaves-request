import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useServerSideSearch } from "./useServerSideSearch";

describe("useServerSideSearch", () => {
  const mockOptions = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
  ];

  const mockSearchFunction = vi.fn().mockResolvedValue({
    items: mockOptions,
    hasNextPage: false,
  });

  it("initializes with empty options and loading false", () => {
    const { result } = renderHook(() =>
      useServerSideSearch(mockSearchFunction),
    );

    expect(result.current.options).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("does not trigger search if searchTerm length is less than minSearchLength", async () => {
    const { result } = renderHook(() =>
      useServerSideSearch(mockSearchFunction),
    );

    await act(async () => {
      await result.current.onSearch("ab");
    });

    expect(mockSearchFunction).not.toHaveBeenCalled();
    expect(result.current.options).toEqual([]);
  });

  it("triggers search if searchTerm length is >= minSearchLength", async () => {
    const { result } = renderHook(() =>
      useServerSideSearch(mockSearchFunction),
    );

    await act(async () => {
      await result.current.onSearch("abc");
    });

    expect(mockSearchFunction).toHaveBeenCalledWith("abc");
    expect(result.current.options).toEqual(mockOptions);
    expect(result.current.loading).toBe(false);
  });

  it("clears options if search term is cleared (shorter than minLength)", async () => {
    const { result } = renderHook(() =>
      useServerSideSearch(mockSearchFunction),
    );

    // First successful search
    await act(async () => {
      await result.current.onSearch("abc");
    });
    expect(result.current.options).toEqual(mockOptions);

    // Clear search
    await act(async () => {
      await result.current.onSearch("a");
    });
    expect(result.current.options).toEqual([]);
  });

  it("handles search errors by clearing options", async () => {
    const errorSearchFunction = vi
      .fn()
      .mockRejectedValue(new Error("Search failed"));
    const { result } = renderHook(() =>
      useServerSideSearch(errorSearchFunction),
    );

    await act(async () => {
      await result.current.onSearch("abc");
    });

    expect(result.current.options).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("triggers initial search if autoTrigger is true", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useServerSideSearch(mockSearchFunction, 3, true),
    );

    // Move timers forward by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Wait for the promise to resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSearchFunction).toHaveBeenCalledWith("");
    vi.useRealTimers();
  });

  it("clears options manually when clearOptions is called", async () => {
    const { result } = renderHook(() =>
      useServerSideSearch(mockSearchFunction),
    );

    await act(async () => {
      await result.current.onSearch("abc");
    });
    expect(result.current.options).toEqual(mockOptions);

    act(() => {
      result.current.clearOptions();
    });
    expect(result.current.options).toEqual([]);
  });
});
