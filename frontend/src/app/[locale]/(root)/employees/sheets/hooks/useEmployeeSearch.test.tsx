import { renderHook } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing/react'
import { useEmployeeSearch } from './useEmployeeSearch'
import { EMPLOYEES_SEARCH_QUERY } from '../../graphql/EmployeeQueries'
import { describe, expect, it } from 'vitest'
import React from 'react'

const mocks = [
  {
    request: {
      query: EMPLOYEES_SEARCH_QUERY,
      variables: { search: 'John', first: 20 },
    },
    result: {
      data: {
        employees: {
          edges: [
            { node: { id: '1', fullName: 'John Doe' } },
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: 'cursor-1',
          },
        },
      },
    },
  },
]

describe('useEmployeeSearch', () => {
  it('returns items correctly after search', async () => {
    const { result } = renderHook(() => useEmployeeSearch(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    })

    const searchFn = result.current
    const data = await searchFn('John')

    expect(data.items).toEqual([{ label: 'John Doe', value: '1' }])
    expect(data.hasNextPage).toBe(false)
  })

  it('handles empty results', async () => {
    const emptyMocks = [
      {
        request: {
          query: EMPLOYEES_SEARCH_QUERY,
          variables: { search: 'Nobody', first: 20 },
        },
        result: {
          data: {
            employees: {
              edges: [],
              pageInfo: {
                hasNextPage: false,
                endCursor: null,
              },
            },
          },
        },
      },
    ]

    const { result } = renderHook(() => useEmployeeSearch(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={emptyMocks} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    })

    const searchFn = result.current
    const data = await searchFn('Nobody')

    expect(data.items).toEqual([])
    expect(data.hasNextPage).toBe(false)
  })
})
