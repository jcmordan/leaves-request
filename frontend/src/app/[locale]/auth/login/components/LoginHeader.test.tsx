import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoginHeader } from "./LoginHeader";

describe("LoginHeader", () => {
  it("renders workspace brand name", () => {
    render(<LoginHeader />);

    expect(screen.getByText("Sovereign Workspace")).toBeInTheDocument();
  });

  it("renders contact link", () => {
    render(<LoginHeader />);

    expect(screen.getByText("Contact")).toBeInTheDocument();
  });
});
