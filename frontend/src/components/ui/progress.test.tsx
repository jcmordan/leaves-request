import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Progress } from "./progress";

describe("Progress", () => {
  it("renders with correct value", () => {
    render(<Progress value={50} />);
    const progress = screen.getByRole("progressbar");
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute("aria-valuenow", "50");
  });

  it("handles undefined value", () => {
    render(<Progress value={undefined} />);
    const progress = screen.getByRole("progressbar");
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute("aria-valuenow", "0");
  });
});
