import type { PageInfo } from '@/__generated__/graphql'

export interface Node {
  id: string
}

export interface ConnectionEdge<T extends Node = Node> {
  cursor: string
  node: T
}

export interface Connection<T extends Node = Node> {
  edges?: Array<ConnectionEdge<T>> | null
  pageInfo: PageInfo
  totalCount?: number | null
}

/**
 * GraphQL Mock Factory
 * Creates mock GraphQL response structures
 */

export function createMockPageInfo(overrides?: Partial<PageInfo>): PageInfo {
  return {
    __typename: 'PageInfo',
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
    ...overrides,
  }
}

export function createMockConnectionEdge<T extends Node>(
  node: T,
  cursor?: string
): ConnectionEdge & { node: T } {
  return {
    cursor: cursor ?? `cursor-${node.id}`,
    node,
  }
}

export function createMockConnection<T extends Node>(
  nodes: T[],
  pageInfo?: Partial<PageInfo>
): Connection & {
  edges: Array<ConnectionEdge & { node: T }>
  pageInfo: PageInfo
} {
  return {
    edges: nodes.map((node, index) => createMockConnectionEdge(node, `cursor-${index}`)),
    pageInfo: createMockPageInfo(pageInfo),
  }
}

export function createMockGraphQLResponse<T>(data: T): {
  data: T
  errors?: never[]
} {
  return {
    data,
    errors: undefined,
  }
}

export function createMockGraphQLError(
  message: string,
  extensions?: Record<string, unknown>
): {
  message: string
  extensions?: Record<string, unknown>
  path?: string[]
} {
  return {
    message,
    extensions,
    path: undefined,
  }
}

export function createMockGraphQLErrorResponse(
  errors: Array<ReturnType<typeof createMockGraphQLError>>
): {
  data: null
  errors: Array<ReturnType<typeof createMockGraphQLError>>
} {
  return {
    data: null,
    errors,
  }
}
