import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoginCard } from "./LoginCard";

describe("LoginCard", () => {
  it("renders children inside the card", () => {
    render(
      <LoginCard>
        <span>Test Content</span>
      </LoginCard>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
