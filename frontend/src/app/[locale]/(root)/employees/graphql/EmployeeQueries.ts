import { graphql } from "@/__generated__";

export const EMPLOYEE_STATS_FRAGMENT = graphql(`
  fragment EmployeeStats on Query {
    employeeStats {
      total
      active
      inactive
      onLeave
    }
  }
`);

export const EMPLOYEE_CONNECTION_FRAGMENT = graphql(`
  fragment GetEmployees_employee on EmployeesConnection {
    edges {
      cursor
      node {
        id
        employeeCode
        fullName
        email
        nationalId
        isActive
        department {
          id
          name
        }
        user {
          id
          role
        }
        jobTitle {
          id
          name
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
`);

export const EMPLOYEE_DIRECTORY_QUERY = graphql(`
  query GetEmployees(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $search: String
  ) {
    employees(
      first: $first
      after: $after
      last: $last
      before: $before
      search: $search
    ) {
      ...GetEmployees_employee
    }
    ...EmployeeStats
  }
`);
