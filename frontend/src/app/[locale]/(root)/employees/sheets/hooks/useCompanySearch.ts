import { useLazyQuery } from "@apollo/client/react";
import { useMemo } from "react";
import { CompaniesSearchQuery, CompaniesSearchQueryVariables } from "@/__generated__/graphql";
import { InputOption } from "@/components/forms/types";
import { COMPANIES_SEARCH_QUERY } from "../../graphql/EmployeeQueries";

type SearchFunction = (
  searchTerm: string,
  after?: string
) => Promise<{
  items: InputOption[];
  hasNextPage: boolean;
  endCursor?: string | null;
}>;

/**
 * Hook for searching companies via GraphQL.
 *
 * @returns {SearchFunction} The search function.
 */
export const useCompanySearch = (): SearchFunction => {
  const [searchCompanies] = useLazyQuery<
    CompaniesSearchQuery,
    CompaniesSearchQueryVariables
  >(COMPANIES_SEARCH_QUERY, {
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
        const { data } = await searchCompanies({
          variables: {
            search: searchTerm.length >= 3 ? searchTerm : null,
            first: 20,
          },
        });

        const edges = data?.companies?.edges ?? [];
        const pageInfo = data?.companies?.pageInfo;

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
    [searchCompanies]
  );
};
