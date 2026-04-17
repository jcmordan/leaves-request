import { graphql } from "@/__generated__";

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
      pendingCount
      membersOnLeave
      approvedVsLastYearPercentage
      availablePercentage
      insightMessage
    }
  }
`);
