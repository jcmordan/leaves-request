import { useLazyQuery } from "@apollo/client/react";
import { useMemo } from "react";
import { DepartmentsSearchQuery, DepartmentsSearchQueryVariables } from "@/__generated__/graphql";
import { InputOption } from "@/components/forms/types";
import { DEPARTMENTS_SEARCH_QUERY } from "../EmployeeEditSheetQueries";

type SearchFunction = (
  searchTerm: string,
  after?: string
) => Promise<{
  items: InputOption[];
  hasNextPage: boolean;
  endCursor?: string | null;
}>;

/**
 * Hook for searching departments via GraphQL.
 *
 * @returns {SearchFunction} The search function.
 */
export const useDepartmentSearch = (): SearchFunction => {
  const [searchDepartments] = useLazyQuery<
    DepartmentsSearchQuery,
    DepartmentsSearchQueryVariables
  >(DEPARTMENTS_SEARCH_QUERY, {
    fetchPolicy: "cache-first",
  });

  return useMemo(
    () =>
      async (
        searchTerm: string,
        after?: string
      ): Promise<{
        items: InputOption[];
        hasNextPage: boolean;
        endCursor?: string | null;
      }> => {
        const { data } = await searchDepartments({
          variables: {
            search: searchTerm.length >= 3 ? searchTerm : null,
            first: 20,
          },
        });

        const edges = data?.departments?.edges ?? [];
        const pageInfo = data?.departments?.pageInfo;

        return {
          items:
            edges.map((edge) => ({
              label: edge?.node?.name ?? "",
              value: edge?.node?.id ?? "",
            })) ?? [],
          hasNextPage: pageInfo?.hasNextPage ?? false,
          endCursor: pageInfo?.endCursor ?? null,
        };
      },
    [searchDepartments]
  );
};
