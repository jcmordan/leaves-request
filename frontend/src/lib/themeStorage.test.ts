import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getThemeStorageKey,
  getStoredTheme,
  setStoredTheme,
  clearStoredTheme,
} from "./themeStorage";

describe("themeStorage", () => {
  // Manual mock for localStorage to avoid environment-specific issues
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      length: 0,
      key: vi.fn((index: number) => Object.keys(store)[index] || null),
    };
  })();

  beforeEach(() => {
    vi.stubGlobal("localStorage", localStorageMock);
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getThemeStorageKey", () => {
    it("returns default key when no userId", () => {
      expect(getThemeStorageKey()).toBe("theme-default");
    });

    it("returns user-specific key", () => {
      expect(getThemeStorageKey("user-123")).toBe("theme-user-123");
    });
  });

  describe("getStoredTheme", () => {
    it("returns default theme when nothing stored", () => {
      expect(getStoredTheme()).toBe("ocean-blue");
    });

    it("returns stored valid theme", () => {
      localStorage.setItem("theme-default", "forest-green");
      expect(getStoredTheme()).toBe("forest-green");
    });

    it("returns default theme for invalid stored value", () => {
      localStorage.setItem("theme-default", "invalid-theme");
      expect(getStoredTheme()).toBe("ocean-blue");
    });

    it("returns stored theme for specific user", () => {
      localStorage.setItem("theme-user-1", "royal-purple");
      expect(getStoredTheme("user-1")).toBe("royal-purple");
    });
  });

  describe("setStoredTheme", () => {
    it("stores theme in localStorage", () => {
      setStoredTheme("forest-green");
      expect(localStorage.setItem).toHaveBeenCalledWith("theme-default", "forest-green");
    });

    it("stores theme for specific user", () => {
      setStoredTheme("slate-blue", "user-1");
      expect(localStorage.setItem).toHaveBeenCalledWith("theme-user-1", "slate-blue");
    });
  });

  describe("clearStoredTheme", () => {
    it("removes theme from localStorage", () => {
      localStorage.setItem("theme-default", "forest-green");
      clearStoredTheme();
      expect(localStorage.removeItem).toHaveBeenCalledWith("theme-default");
    });

    it("removes theme for specific user", () => {
      localStorage.setItem("theme-user-1", "slate-blue");
      clearStoredTheme("user-1");
      expect(localStorage.removeItem).toHaveBeenCalledWith("theme-user-1");
    });
  });
});
