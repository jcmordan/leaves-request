import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockUseQuery = vi.fn();
const mockReadQuery = vi.fn();
const mockWriteQuery = vi.fn();
const mockRefetch = vi.fn();

vi.mock("@apollo/client/react", () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
  useApolloClient: () => ({
    readQuery: mockReadQuery,
    writeQuery: mockWriteQuery,
  }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { accessToken: "token-123" },
    status: "authenticated",
  }),
}));

import { usePaginatedQuery } from "./usePaginatedQuery";

const MOCK_QUERY = {} as any;

const mockPageInfo = {
  hasNextPage: true,
  hasPreviousPage: false,
  startCursor: "cursor-start",
  endCursor: "cursor-end",
};

const mockData = {
  items: {
    edges: [{ node: { id: "1" } }],
    pageInfo: mockPageInfo,
  },
};

describe("usePaginatedQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    mockReadQuery.mockReturnValue(null);
  });

  const getPageInfo = (data: any) => data?.items?.pageInfo;

  it("returns data from useQuery", () => {
    const { result } = renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, { getPageInfo }),
    );

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns pageInfo extracted via getPageInfo", () => {
    const { result } = renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, { getPageInfo }),
    );

    expect(result.current.pageInfo).toEqual(mockPageInfo);
  });

  it("uses default pageSize of 10", () => {
    renderHook(() => usePaginatedQuery(MOCK_QUERY, { getPageInfo }));

    expect(mockUseQuery).toHaveBeenCalledWith(
      MOCK_QUERY,
      expect.objectContaining({
        variables: expect.objectContaining({ first: 10 }),
      }),
    );
  });

  it("uses custom pageSize", () => {
    renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, { getPageInfo, pageSize: 25 }),
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      MOCK_QUERY,
      expect.objectContaining({
        variables: expect.objectContaining({ first: 25 }),
      }),
    );
  });

  it("merges base variables with pagination variables", () => {
    renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, {
        getPageInfo,
        variables: { status: "active" },
      }),
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      MOCK_QUERY,
      expect.objectContaining({
        variables: expect.objectContaining({ status: "active", first: 10 }),
      }),
    );
  });

  it("nextPage sets after cursor and clears before", () => {
    const { result } = renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, { getPageInfo }),
    );

    act(() => result.current.nextPage());

    expect(mockUseQuery).toHaveBeenLastCalledWith(
      MOCK_QUERY,
      expect.objectContaining({
        variables: expect.objectContaining({
          first: 10,
          after: "cursor-end",
          last: undefined,
          before: undefined,
        }),
      }),
    );
  });

  it("previousPage sets before cursor and clears after", () => {
    const { result } = renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, { getPageInfo }),
    );

    act(() => result.current.previousPage());

    expect(mockUseQuery).toHaveBeenLastCalledWith(
      MOCK_QUERY,
      expect.objectContaining({
        variables: expect.objectContaining({
          last: 10,
          before: "cursor-start",
          first: undefined,
          after: undefined,
        }),
      }),
    );
  });

  it("nextPage does nothing when endCursor is null", () => {
    mockUseQuery.mockReturnValue({
      data: {
        items: { edges: [], pageInfo: { ...mockPageInfo, endCursor: null } },
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, { getPageInfo }),
    );

    const callCountBefore = mockUseQuery.mock.calls.length;

    act(() => result.current.nextPage());

    // Variables should not have changed (no re-render with new pagination vars)
    expect(mockUseQuery.mock.calls.length).toBe(callCountBefore);
  });

  it("previousPage does nothing when startCursor is null", () => {
    mockUseQuery.mockReturnValue({
      data: {
        items: { edges: [], pageInfo: { ...mockPageInfo, startCursor: null } },
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, { getPageInfo }),
    );

    const callCountBefore = mockUseQuery.mock.calls.length;

    act(() => result.current.previousPage());

    expect(mockUseQuery.mock.calls.length).toBe(callCountBefore);
  });

  it("hydrates cache with initialData on first page", () => {
    renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, { getPageInfo, initialData: mockData }),
    );

    expect(mockWriteQuery).toHaveBeenCalledWith(
      expect.objectContaining({ data: mockData }),
    );
  });

  it("does not hydrate cache when data already exists", () => {
    mockReadQuery.mockReturnValue(mockData);

    renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, { getPageInfo, initialData: mockData }),
    );

    expect(mockWriteQuery).not.toHaveBeenCalled();
  });

  it("returns undefined data when query returns no data", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, { getPageInfo }),
    );

    expect(result.current.data).toBeUndefined();
  });

  it("exposes refetch from useQuery", () => {
    const { result } = renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, { getPageInfo }),
    );

    result.current.refetch();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("uses cache-and-network as default fetchPolicy", () => {
    renderHook(() => usePaginatedQuery(MOCK_QUERY, { getPageInfo }));

    expect(mockUseQuery).toHaveBeenCalledWith(
      MOCK_QUERY,
      expect.objectContaining({ fetchPolicy: "cache-and-network" }),
    );
  });

  it("uses custom fetchPolicy when provided", () => {
    renderHook(() =>
      usePaginatedQuery(MOCK_QUERY, {
        getPageInfo,
        fetchPolicy: "network-only",
      }),
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      MOCK_QUERY,
      expect.objectContaining({ fetchPolicy: "network-only" }),
    );
  });
});
