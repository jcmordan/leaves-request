import { graphql } from "@/__generated__";

export const ALL_REQUESTS_QUERY = graphql(`
  query Administration_GetAllRequests(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $status: RequestStatus
  ) {
    absenceRequests(
       first: $first
       after: $after
       last: $last
       before: $before
       status: $status
    ) {
      ... on AbsenceRequestsConnection {
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
  }
`);
