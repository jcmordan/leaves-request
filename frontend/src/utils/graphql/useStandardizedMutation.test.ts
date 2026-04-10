import { describe, expect, it, vi } from 'vitest'

// We test extractErrorMessage by importing the module and accessing it indirectly
// Since it's not exported, we test it through the hook behavior
// But we can also test it by mocking useMutation and exercising the hook

const mockMutate = vi.fn()
vi.mock('@apollo/client/react', () => ({
  useMutation: () => [mockMutate, { loading: false, error: null }],
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { useStandardizedMutation } from './useStandardizedMutation'
import { toast } from 'sonner'

describe('useStandardizedMutation', () => {
  const mockMutation = {} as any

  it('returns mutate function, submitting state, and error', () => {
    const result = useStandardizedMutation({ mutation: mockMutation })
    expect(result.mutate).toBeInstanceOf(Function)
    expect(result.submitting).toBe(false)
    expect(result.error).toBeNull()
  })

  it('shows success toast when message is provided and mutation succeeds', async () => {
    mockMutate.mockResolvedValueOnce({ data: { id: '1' } })

    const result = useStandardizedMutation({
      mutation: mockMutation,
      message: 'Created successfully',
    })

    const data = await result.mutate({} as any)
    expect(data).toEqual({ id: '1' })
    expect(toast.success).toHaveBeenCalledWith('Created successfully')
  })

  it('does not show success toast when message is not provided', async () => {
    mockMutate.mockResolvedValueOnce({ data: { id: '1' } })
    vi.mocked(toast.success).mockClear()

    const result = useStandardizedMutation({ mutation: mockMutation })
    await result.mutate({} as any)
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('throws when mutation returns no data', async () => {
    mockMutate.mockResolvedValueOnce({ data: null })

    const result = useStandardizedMutation({ mutation: mockMutation })
    await expect(result.mutate({} as any)).rejects.toThrow('No data returned from mutation')
  })

  it('shows error toast and rethrows on mutation failure', async () => {
    mockMutate.mockRejectedValueOnce(new Error('Network error'))

    const result = useStandardizedMutation({
      mutation: mockMutation,
      errorMessage: 'Something went wrong',
    })

    await expect(result.mutate({} as any)).rejects.toThrow('Network error')
    expect(toast.error).toHaveBeenCalledWith('Something went wrong')
  })

  it('extracts graphQL error messages', async () => {
    const graphQLError = {
      graphQLErrors: [{ message: 'Validation failed' }],
    }
    mockMutate.mockRejectedValueOnce(graphQLError)

    const result = useStandardizedMutation({ mutation: mockMutation })
    await expect(result.mutate({} as any)).rejects.toThrow('Validation failed')
  })

  it('extracts network error messages', async () => {
    const networkError = {
      networkError: { message: 'Connection refused' },
    }
    mockMutate.mockRejectedValueOnce(networkError)

    const result = useStandardizedMutation({ mutation: mockMutation })
    await expect(result.mutate({} as any)).rejects.toThrow('Connection refused')
  })

  it('extracts generic message from error object', async () => {
    const error = { message: 'Something happened' }
    mockMutate.mockRejectedValueOnce(error)

    const result = useStandardizedMutation({ mutation: mockMutation })
    await expect(result.mutate({} as any)).rejects.toThrow('Something happened')
  })

  it('uses fallback message for non-object errors', async () => {
    mockMutate.mockRejectedValueOnce('string error')

    const result = useStandardizedMutation({ mutation: mockMutation })
    await expect(result.mutate({} as any)).rejects.toThrow('An unexpected error occurred')
  })

  it('does not show error toast when errorMessage is not provided', async () => {
    mockMutate.mockRejectedValueOnce(new Error('fail'))
    vi.mocked(toast.error).mockClear()

    const result = useStandardizedMutation({ mutation: mockMutation })
    await expect(result.mutate({} as any)).rejects.toThrow()
    expect(toast.error).not.toHaveBeenCalled()
  })
})
