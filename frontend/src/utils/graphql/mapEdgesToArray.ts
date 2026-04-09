export const mapEdgesToArray = <T>(
  edges?: ReadonlyArray<{
    readonly node: {
      readonly [key: string]: any
    }
  }> | null
): T[] => {
  return edges?.map(edge => ({
    ...edge.node,
  })) as T[]
}
