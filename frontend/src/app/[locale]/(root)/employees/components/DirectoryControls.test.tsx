import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DirectoryControls } from "./DirectoryControls";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children }: { children: ReactNode }) => (
    <button>{children}</button>
  ),
}));

vi.mock("lucide-react", () => ({
  Plus: () => <span data-testid="plus-icon" />,
}));

vi.mock("@/components/filters/FilterSearchInput", () => ({
  FilterSearchInput: ({
    value,
    onChange,
    onSearch,
  }: {
    value: string;
    onChange: (value?: string) => void;
    onSearch: (value?: string) => void;
  }) => (
    <div>
      <input data-testid="search-input" value={value} readOnly />
      <button
        type="button"
        data-testid="change-value"
        onClick={() => onChange("Luis")}
      >
        change
      </button>
      <button
        type="button"
        data-testid="search-undefined"
        onClick={() => onSearch()}
      >
        search undefined
      </button>
    </div>
  ),
}));

describe("DirectoryControls", () => {
  it("defaults query to empty string when searchValue is not provided", () => {
    const onSearch = vi.fn();

    render(<DirectoryControls onSearch={onSearch} />);
    expect(screen.getByTestId("search-input")).toHaveValue("");
  });

  it("uses current query when callback receives undefined", () => {
    const onSearch = vi.fn();

    render(<DirectoryControls onSearch={onSearch} searchValue="Ana" />);

    fireEvent.click(screen.getByTestId("search-undefined"));
    expect(onSearch).toHaveBeenCalledWith("Ana");
  });

  it("updates query and calls onSearch when filter changes", () => {
    const onSearch = vi.fn();

    const { rerender } = render(
      <DirectoryControls onSearch={onSearch} searchValue="Ana" />,
    );
    fireEvent.click(screen.getByTestId("change-value"));
    expect(onSearch).toHaveBeenCalledWith("Luis");

    rerender(<DirectoryControls onSearch={onSearch} searchValue="Maria" />);
    expect(screen.getByTestId("search-input")).toHaveValue("Maria");
  });
});
