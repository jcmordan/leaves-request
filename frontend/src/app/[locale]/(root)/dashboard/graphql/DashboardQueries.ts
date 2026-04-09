import { graphql } from "@/__generated__";

export const DASHBOARD_DATA_QUERY = graphql(`
  query GetDashboardData {
    myRequests(first: 10) {
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
      }
    }
    absenceTypes {
      edges {
        node {
          id
          name
          deductsFromBalance
        }
      }
    }
  }
`);
