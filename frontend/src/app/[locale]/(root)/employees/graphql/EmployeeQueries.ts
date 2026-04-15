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
          roles
        }
        jobTitle {
          id
          name
        }
        an8
        company {
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

export const EMPLOYEE_DETAILS_HERO_FRAGMENT = graphql(`
  fragment EmployeeDetailsHero on Employee {
    id
    fullName
    isActive
    jobTitle {
      id
      name
    }
  }
`);

export const EMPLOYEE_CORPORATE_DATA_FRAGMENT = graphql(`
  fragment EmployeeCorporateData on Employee {
    employeeCode
    an8
    department {
      id
      name
    }
    company {
      id
      name
    }
  }
`);

export const EMPLOYEE_REPORTING_STRUCTURE_FRAGMENT = graphql(`
  fragment EmployeeReportingStructure on Employee {
    manager {
      id
      fullName
      jobTitle {
        id
        name
      }
    }
    subordinates {
      id
      fullName
    }
  }
`);

export const EMPLOYEE_PERSONAL_INFO_FRAGMENT = graphql(`
  fragment EmployeePersonalInfo on Employee {
    email
    nationalId
    hireDate
  }
`);

export const EMPLOYEE_LEAVE_BALANCE_FRAGMENT = graphql(`
  fragment EmployeeLeaveBalance on Employee {
    leaveBalance {
      totalEntitlement
      taken
      remaining
      availablePercentage
    }
  }
`);

export const EMPLOYEE_DETAILS_QUERY = graphql(`
  query GetEmployeeDetails($id: UUID!) {
    employee(id: $id) {
      ...EmployeeDetailsHero
      ...EmployeeCorporateData
      ...EmployeeReportingStructure
      ...EmployeePersonalInfo
      ...EmployeeLeaveBalance
    }
  }
`);

export const EMPLOYEE_ENTITIES_INFO_FRAGMENT = graphql(`
  fragment EmployeeEntitiesInfo on Employee {
    id
    jobTitle {
      id
      name
    }
    department {
      id
      name
    }
    departmentSection {
      id
      name
    }
    company {
      id
      name
    }
    manager {
      id
      fullName
    }
  }
`);

export const EMPLOYEE_FOR_EDIT_QUERY = graphql(`
  query GetEmployeeForEdit($id: UUID!) {
    employee(id: $id) {
      id
      fullName
      email
      employeeCode
      an8
      nationalId
      hireDate
      isActive
      jobTitle {
        id
      }
      department {
        id
      }
      departmentSection {
        id
      }
      company {
        id
      }
      manager {
        id
      }
      ...EmployeeEntitiesInfo
    }
  }
`);

export const UPDATE_EMPLOYEE_MUTATION = graphql(`
  mutation UpdateEmployee($input: UpdateEmployeeInput!) {
    updateEmployee(input: $input) {
      id
      ...EmployeeDetailsHero
      ...EmployeeCorporateData
      ...EmployeeReportingStructure
      ...EmployeePersonalInfo
      ...EmployeeLeaveBalance
    }
  }
`);

export const JOB_TITLES_SEARCH_QUERY = graphql(`
  query JobTitlesSearch($search: String, $first: Int) {
    jobTitles(search: $search, first: $first) {
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const COMPANIES_SEARCH_QUERY = graphql(`
  query CompaniesSearch($search: String, $first: Int) {
    companies(search: $search, first: $first) {
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const DEPARTMENTS_SEARCH_QUERY = graphql(`
  query DepartmentsSearch($search: String, $first: Int) {
    departments(search: $search, first: $first) {
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const DEPARTMENT_SECTIONS_SEARCH_QUERY = graphql(`
  query DepartmentSectionsSearch(
    $search: String
    $first: Int
    $departmentId: UUID
  ) {
    departmentSections(
      search: $search
      first: $first
      departmentId: $departmentId
    ) {
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const EMPLOYEES_SEARCH_QUERY = graphql(`
  query EmployeesSearch($search: String, $first: Int) {
    employees(search: $search, first: $first) {
      edges {
        node {
          id
          fullName
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);
