import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApproverCard } from "./ApproverCard";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock GraphQL fragments
vi.mock("@/__generated__", () => ({
  useFragment: (_fragment: any, data: any) => data,
  graphql: (s: any) => s,
}));

// Mock getInitials
vi.mock("@/utils/formatters", () => ({
  getInitials: (name: string) => name.split(" ").map(n => n[0]).join(""),
}));

const mockRequestWithApprover = {
  employee: {
    manager: {
      fullName: "Jane Smith",
      jobTitle: { name: "Operations Manager" },
    },
  },
};

const mockRequestWithoutApprover = {
  employee: {
    manager: null,
  },
};

describe("ApproverCard", () => {
  it("should render with approver details", () => {
    render(<ApproverCard requestRef={mockRequestWithApprover as any} />);

    expect(screen.getByText("currentApprover")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Operations Manager")).toBeInTheDocument();
    expect(screen.getByText("JS")).toBeInTheDocument(); // Initials
    expect(screen.getByText("responseTime")).toBeInTheDocument();
  });

  it("should use 'Lead' as fallback job title", () => {
    const request = {
      employee: {
        manager: {
          fullName: "Jane Smith",
          jobTitle: null,
        },
      },
    };
    render(<ApproverCard requestRef={request as any} />);

    expect(screen.getByText("Lead")).toBeInTheDocument();
  });

  it("should return null when no approver is assigned", () => {
    const { container } = render(<ApproverCard requestRef={mockRequestWithoutApprover as any} />);

    expect(container.firstChild).toBeNull();
  });
});
