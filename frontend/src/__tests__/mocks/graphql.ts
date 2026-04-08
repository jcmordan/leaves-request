import {
  type PageInfo,
  type PatientAccountStatementHeaderFragment,
} from '@/__generated__/graphql'

import {
  createMockConnection as _createMockConnection,
  createMockConnectionEdge as _createMockConnectionEdge,
  createMockGraphQLResponse as _createMockGraphQLResponse,
  createMockPageInfo as _createMockPageInfo,
  type Connection,
  type ConnectionEdge,
  type Node,
} from '../factories/graphql'

/**
 * GraphQL Mock Utilities
 * Provides pre-configured mock functions for appointments components
 */

/**
 * Creates a mock GraphQL connection
 * @returns Mocked connection
 */
export const createMockConnection = <T extends Node>(nodes: T[]): Connection<T> =>
  _createMockConnection(nodes)

/**
 * Creates a mock GraphQL connection edge
 * @returns Mocked edge
 */
export const createMockConnectionEdge = <T extends Node>(node: T): ConnectionEdge<T> =>
  _createMockConnectionEdge(node)

/**
 * Creates a mock GraphQL page info
 * @returns Mocked page info
 */
export const createMockPageInfo = (): PageInfo => _createMockPageInfo()

/**
 * Creates a mock GraphQL response
 * @returns Mocked response
 */
export const createMockGraphQLResponse = (data: any) => _createMockGraphQLResponse(data)

export { type PatientAccountStatementHeaderFragment }
