import { graphql } from "@/__generated__";

export const TEAM_ABSENCES_QUERY = graphql(`
  query Approvals_GetTeamAbsences(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $status: RequestStatus
  ) {
    teamAbsences(
      first: $first
      after: $after
      last: $last
      before: $before
      status: $status
    ) {
      nodes {
        ...RequestList_ItemFields
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);
