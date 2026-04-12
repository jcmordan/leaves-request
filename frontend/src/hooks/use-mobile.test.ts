import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
  let listeners: Array<() => void> = [];

  beforeEach(() => {
    listeners = [];

    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_event: string, handler: () => void) => {
        listeners.push(handler);
      },
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("returns false for desktop viewport", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true for mobile viewport", () => {
    Object.defineProperty(window, "innerWidth", { value: 500, writable: true });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("updates when viewport changes", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        value: 500,
        writable: true,
      });
      listeners.forEach((l) => l());
    });

    expect(result.current).toBe(true);
  });
});
