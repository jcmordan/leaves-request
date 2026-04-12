import { useLazyQuery } from "@apollo/client/react";
import { useMemo } from "react";
import {
  JobTitlesSearchQuery,
  JobTitlesSearchQueryVariables,
} from "@/__generated__/graphql";
import { InputOption } from "@/components/forms/types";
import { JOB_TITLES_SEARCH_QUERY } from "../../graphql/EmployeeQueries";

type SearchFunction = (
  searchTerm: string,
  after?: string,
) => Promise<{
  items: InputOption[];
  hasNextPage: boolean;
  endCursor?: string | null;
}>;

/**
 * Hook for searching job titles via GraphQL.
 *
 * @returns {SearchFunction} The search function.
 */
export const useJobTitleSearch = (): SearchFunction => {
  const [searchJobTitles] = useLazyQuery<
    JobTitlesSearchQuery,
    JobTitlesSearchQueryVariables
  >(JOB_TITLES_SEARCH_QUERY, {
    fetchPolicy: "cache-first",
  });

  return useMemo(
    () =>
      async (
        searchTerm: string,
        after?: string,
      ): Promise<{
        items: InputOption[];
        hasNextPage: boolean;
        endCursor?: string | null;
      }> => {
        const { data } = await searchJobTitles({
          variables: {
            search: searchTerm.length >= 3 ? searchTerm : null,
            first: 20,
          },
        });

        const edges = data?.jobTitles?.edges ?? [];
        const pageInfo = data?.jobTitles?.pageInfo;

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
    [searchJobTitles],
  );
};
