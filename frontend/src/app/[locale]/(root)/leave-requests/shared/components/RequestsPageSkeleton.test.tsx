import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RequestsPageSkeleton from "./RequestsPageSkeleton";

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe("RequestsPageSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<RequestsPageSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders multiple skeleton elements", () => {
    const { getAllByTestId } = render(<RequestsPageSkeleton />);

    const skeletons = getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(10);
  });

  it("applies animate-pulse to root element", () => {
    const { container } = render(<RequestsPageSkeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });
});
