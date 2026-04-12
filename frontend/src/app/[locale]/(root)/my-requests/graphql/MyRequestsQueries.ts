import { graphql } from "@/__generated__";

export const MY_BALANCE_FRAGMENT = graphql(`
  fragment MyBalanceFragment on LeaveBalanceDto {
    totalEntitlement
    taken
    remaining
    availablePercentage
    totalRequests
    pendingRequests
    approvedRequests
    rejectedRequests
    cancelledRequests
  }
`);

export const MY_REQUEST_ITEM_FRAGMENT = graphql(`
  fragment MyRequestItemFragment on AbsenceRequest {
    id
    startDate
    endDate
    status
    reason
    createdAt
    absenceType {
      id
      name
    }
    employee {
      id
      fullName
    }
    requesterEmployee {
      id
      fullName
    }
  }
`);

export const MY_REQUESTS_CONNECTION_FRAGMENT = graphql(`
  fragment MyRequestsConnectionFragment on MyRequestsConnection {
    nodes {
      ...MyRequestItemFragment
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
`);

export const MY_REQUESTS_QUERY = graphql(`
  query GetMyRequests(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $status: RequestStatus
  ) {
    myBalance {
      ...MyBalanceFragment
    }
    myRequests(
      first: $first
      after: $after
      last: $last
      before: $before
      status: $status
    ) {
      ...MyRequestsConnectionFragment
    }
  }
`);
