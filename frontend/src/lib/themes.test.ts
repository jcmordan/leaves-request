import { describe, expect, it } from "vitest";
import { defaultTheme, getTheme, isValidTheme, type ThemeName } from "./themes";

describe("themes", () => {
  describe("defaultTheme", () => {
    it("is ocean-blue", () => {
      expect(defaultTheme).toBe("ocean-blue");
    });
  });

  describe("getTheme", () => {
    it("returns theme object for valid theme name", () => {
      const theme = getTheme("ocean-blue");
      expect(theme).toBeDefined();
      expect(theme?.name).toBe("ocean-blue");
    });

    it("returns undefined for unknown theme name", () => {
      const theme = getTheme("nonexistent" as ThemeName);
      expect(theme).toBeUndefined();
    });

    it("returns theme with expected color properties", () => {
      const theme = getTheme("forest-green");
      expect(theme).toBeDefined();
      expect(theme?.light).toBeDefined();
      expect(theme?.dark).toBeDefined();
      expect(theme?.preview).toBeDefined();
    });
  });

  describe("isValidTheme", () => {
    it("returns true for valid theme name", () => {
      expect(isValidTheme("ocean-blue")).toBe(true);
      expect(isValidTheme("forest-green")).toBe(true);
      expect(isValidTheme("royal-purple")).toBe(true);
    });

    it("returns false for invalid theme name", () => {
      expect(isValidTheme("nonexistent")).toBe(false);
      expect(isValidTheme("")).toBe(false);
    });
  });
});
