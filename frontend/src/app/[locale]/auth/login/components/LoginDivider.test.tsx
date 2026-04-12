import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginDivider } from "./LoginDivider";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("LoginDivider", () => {
  it("renders divider with 'or' text", () => {
    render(<LoginDivider />);

    expect(screen.getByText("dividerOr")).toBeInTheDocument();
  });
});
