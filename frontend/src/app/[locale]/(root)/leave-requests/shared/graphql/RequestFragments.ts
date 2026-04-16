import { graphql } from "@/__generated__";

export const SHARED_BALANCE_FRAGMENT = graphql(`
  fragment Shared_BalanceFields on LeaveBalanceDto {
    id
    employeeId
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

export const SHARED_REQUEST_ITEM_FRAGMENT = graphql(`
  fragment Shared_RequestItemFields on AbsenceRequest {
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
  }
`);

export const REQUEST_LIST_ITEM_FRAGMENT = graphql(`
  fragment RequestList_ItemFields on AbsenceRequest {
    id
    status
    createdAt
    startDate
    endDate
    absenceType {
      id
      name
    }
    employee {
      id
      fullName
    }
  }
`);

export const REQUEST_LIST_CONNECTION_FRAGMENT = graphql(`
  fragment RequestList_ConnectionFields on MyRequestsConnection {
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
`);

export const DASHBOARD_SUMMARY_FIELDS = graphql(`
  fragment Dashboard_SummaryFields on LeaveRequestSummary {
    pendingCount
    rejectedCount
    avgResponseTimeHours
    approvedThisMonthCount
    approvedVsLastYearPercentage
    insightMessage
    availablePercentage
    totalTeamMembers
    membersOnLeave
    pendingMembersOnLeave
    upcomingMinAvailablePercentage
    upcomingMinAvailableDate
    trendData {
      label
      count
    }
  }
`);
