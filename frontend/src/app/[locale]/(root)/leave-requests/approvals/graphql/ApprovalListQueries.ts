import { graphql } from "@/__generated__";

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

export const GET_APPROVALS_DASHBOARD_QUERY = graphql(`
  query Approvals_GetDashboard(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $status: RequestStatus
    $today: DateTime
    $forecastDays: Int
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
    leaveRequestSummary(today: $today, forecastDays: $forecastDays) {
      ...Dashboard_SummaryFields
    }
  }
`);

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

export const APPROVALS_DASHBOARD_SUMMARY_QUERY = graphql(`
  query Approvals_GetDashboardSummary($today: DateTime) {
    leaveRequestSummary(today: $today) {
      ...Dashboard_SummaryFields
    }
  }
`);
