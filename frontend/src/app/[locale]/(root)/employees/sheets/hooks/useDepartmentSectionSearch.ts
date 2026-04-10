import { useLazyQuery } from "@apollo/client/react";
import { useMemo } from "react";
import { DepartmentSectionsSearchQuery, DepartmentSectionsSearchQueryVariables } from "@/__generated__/graphql";
import { InputOption } from "@/components/forms/types";
import { DEPARTMENT_SECTIONS_SEARCH_QUERY } from "../EmployeeEditSheetQueries";

type SearchFunction = (
  searchTerm: string,
  departmentId?: string | null,
  after?: string
) => Promise<{
  items: InputOption[];
  hasNextPage: boolean;
  endCursor?: string | null;
}>;

/**
 * Hook for searching department sections via GraphQL.
 *
 * @returns {SearchFunction} The search function.
 */
export const useDepartmentSectionSearch = (): SearchFunction => {
  const [searchDepartmentSections] = useLazyQuery<
    DepartmentSectionsSearchQuery,
    DepartmentSectionsSearchQueryVariables
  >(DEPARTMENT_SECTIONS_SEARCH_QUERY, {
    fetchPolicy: "cache-first",
  });

  return useMemo(
    () =>
      async (
        searchTerm: string,
        departmentId?: string | null,
        after?: string
      ): Promise<{
        items: InputOption[];
        hasNextPage: boolean;
        endCursor?: string | null;
      }> => {
        const { data } = await searchDepartmentSections({
          variables: {
            search: searchTerm.length >= 3 ? searchTerm : null,
            first: 20,
            departmentId: departmentId,
          },
        });

        const edges = data?.departmentSections?.edges ?? [];
        const pageInfo = data?.departmentSections?.pageInfo;

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
    [searchDepartmentSections]
  );
};
