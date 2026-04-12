import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoginCardFooter } from "./LoginCardFooter";

describe("LoginCardFooter", () => {
  it("renders copyright with current year", () => {
    render(<LoginCardFooter />);

    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });
});
