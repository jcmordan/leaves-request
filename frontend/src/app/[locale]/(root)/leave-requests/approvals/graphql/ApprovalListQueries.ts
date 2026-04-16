import { graphql } from "@/__generated__";
export { 
    DASHBOARD_SUMMARY_FIELDS, 
    REQUEST_LIST_ITEM_FRAGMENT 
} from "../../shared/graphql/RequestFragments";

// Using shared fragments from RequestFragments.ts to avoid duplicate registration warnings


export const GET_APPROVALS_DASHBOARD_QUERY = graphql(`
  query Approvals_GetDashboard(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $status: RequestStatus
    $today: Date
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
  query Approvals_GetDashboardSummary($today: Date) {
    leaveRequestSummary(today: $today) {
      ...Dashboard_SummaryFields
    }
  }
`);
