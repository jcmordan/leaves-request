import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmployeeAvatar } from "./EmployeeAvatar";

describe("EmployeeAvatar", () => {
  it("renders initials correctly", () => {
    render(<EmployeeAvatar fullName="John Doe" />);
    
    // getInitials("John Doe") should be "JD"
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("applies custom class names", () => {
    const { container } = render(
      <EmployeeAvatar 
        fullName="John Doe" 
        className="outer-class" 
        avatarClassName="inner-class" 
      />
    );

    const outer = container.firstChild;
    expect(outer).toHaveClass("outer-class");
    
    const inner = screen.getByText("JD");
    expect(inner).toHaveClass("inner-class");
  });

  it("renders children (badges) when provided", () => {
    render(
      <EmployeeAvatar fullName="John Doe">
        <div data-testid="status-badge">🟢</div>
      </EmployeeAvatar>
    );

    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
  });
});
