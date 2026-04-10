import { useLazyQuery } from "@apollo/client/react";
import { useCallback } from "react";
import { EMPLOYEES_SEARCH_QUERY } from "../../graphql/EmployeeQueries";

/**
 * Hook for performing employee server-side search.
 *
 * @returns {Function} Search function for useServerSideSearch.
 */
export const useEmployeeSearch = () => {
  const [loadEmployees] = useLazyQuery(EMPLOYEES_SEARCH_QUERY, {
    fetchPolicy: "network-only",
  });

  return useCallback(
    async (search: string) => {
      const { data } = await loadEmployees({
        variables: {
          search,
          first: 20,
        },
      });

      return {
        items:
          data?.employees?.edges?.map((e: any) => ({
            label: e.node.fullName,
            value: e.node.id,
          })) ?? [],
        hasNextPage: data?.employees?.pageInfo.hasNextPage ?? false,
        endCursor: data?.employees?.pageInfo.endCursor,
      };
    },
    [loadEmployees],
  );
};
