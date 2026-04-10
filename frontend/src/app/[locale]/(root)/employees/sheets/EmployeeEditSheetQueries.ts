import { graphql } from "@/__generated__";

export const EMPLOYEE_EDIT_METADATA_FRAGMENT = graphql(`
  fragment EmployeeEditMetadata on Query {
    jobTitles(first: 10) {
      edges {
        node {
          id
          name
        }
      }
    }
    departments(first: 10) {
      edges {
        node {
          id
          name
        }
      }
    }
    companies(first: 10) {
      edges {
        node {
          id
          name
        }
      }
    }
    employees(first: 10) {
      edges {
        node {
          id
          fullName
        }
      }
    }
    departmentSections(first: 10) {
      edges {
        node {
          id
          name
          departmentId
        }
      }
    }
  }
`);

export const EMPLOYEE_BASIC_INFO_FRAGMENT = graphql(`
  fragment EmployeeBasicInfo on Employee {
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
      ...EmployeeBasicInfo
    }
    ...EmployeeEditMetadata
  }
`);

export const UPDATE_EMPLOYEE_MUTATION = graphql(`
  mutation UpdateEmployee($input: UpdateEmployeeInput!) {
    updateEmployee(input: $input) {
      id
      fullName
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
  query DepartmentSectionsSearch($search: String, $first: Int, $departmentId: UUID) {
    departmentSections(search: $search, first: $first, departmentId: $departmentId) {
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
