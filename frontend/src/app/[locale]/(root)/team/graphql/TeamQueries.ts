import { graphql } from "@/__generated__";
import { DASHBOARD_SUMMARY_FIELDS } from "../../leave-requests/shared/graphql/RequestFragments";

export const GET_TEAM_CALENDAR_QUERY = graphql(`
  query Team_GetCalendarData($today: Date, $forecastDays: Int) {
    teamAbsences(first: 50) {
      nodes {
        id
        startDate
        endDate
        status
        reason
        absenceType {
          id
          name
        }
        employee {
          id
          fullName
        }
      }
    }
    leaveRequestSummary(today: $today, forecastDays: $forecastDays) {
      ...Dashboard_SummaryFields
    }
  }
`);
