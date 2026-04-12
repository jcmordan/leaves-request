import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmployeeTable } from "./EmployeeTable";

const useFragmentMock = vi.fn();
const useEmployeeColumnsMock = vi.fn();

vi.mock("@/__generated__", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/__generated__")>();
  return {
    ...actual,
    useFragment: (...args: unknown[]) => useFragmentMock(...args),
  };
});

vi.mock("./EmployeeColumns", () => ({
  useEmployeeColumns: () => useEmployeeColumnsMock(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/ui/empty-state", () => ({
  EmptyState: () => <div data-testid="empty-state">empty</div>,
}));

vi.mock("@/components/ui/paginated-data-table", () => ({
  PaginatedDataTable: ({
    data,
    pageInfo,
  }: {
    data: Array<{ id?: string }>;
    pageInfo: { hasNextPage?: boolean };
  }) => (
    <div data-testid="paginated-table">
      rows:{data.length}-next:{String(pageInfo?.hasNextPage)}
    </div>
  ),
}));

describe("EmployeeTable", () => {
  it("renders empty state when fragment result is null", () => {
    useFragmentMock.mockReturnValue(null);
    useEmployeeColumnsMock.mockReturnValue([]);

    render(<EmployeeTable variables={{}} employeesRef={null} />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders empty state when fragment has no edges", () => {
    useFragmentMock.mockReturnValue({ edges: [] });
    useEmployeeColumnsMock.mockReturnValue([]);

    render(<EmployeeTable variables={{}} employeesRef={null} />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders paginated table when employees exist", () => {
    useFragmentMock.mockReturnValue({
      edges: [
        { node: { id: "1", fullName: "Ada Lovelace" } },
        undefined,
        { node: { id: "2", fullName: "Grace Hopper" } },
      ],
      pageInfo: { hasNextPage: true },
    });
    useEmployeeColumnsMock.mockReturnValue([{ accessorKey: "fullName" }]);

    render(<EmployeeTable variables={{}} employeesRef={{} as never} />);

    expect(screen.getByTestId("paginated-table")).toHaveTextContent(
      "rows:3-next:true",
    );
  });
});
