/**
 * Securely extracts Apollo pagination and filter variables from Next.js searchParams.
 * Ensures type safety and prevents over-fetching.
 */
export async function getUrlVariables(
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>,
  options: {
    defaultFirst?: number
    mapSearchToVariables?: (search: Record<string, any>) => Record<string, any>
  } = {}
) {
  const resolved = await searchParams
  const { first, after, last, before, ...rest } = resolved

  const pagination: Record<string, any> = {}
  if (first) {
    pagination.first = Number.parseInt(first as string, 10)
  }
  if (after) {
    pagination.after = after as string
  }
  if (last) {
    pagination.last = Number.parseInt(last as string, 10)
  }
  if (before) {
    pagination.before = before as string
  }

  // Default to first: N if no pagination is provided
  if (!first && !after && !last && !before && options.defaultFirst) {
    pagination.first = options.defaultFirst
  }

  const filters = options.mapSearchToVariables ? options.mapSearchToVariables(rest) : rest

  return {
    ...pagination,
    ...filters,
  }
}
