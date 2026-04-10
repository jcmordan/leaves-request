import { gql } from "@apollo/client";

export const EMPLOYEE_EDIT_METADATA_QUERY = gql`
  query GetEmployeeEditMetadata($departmentId: UUID) {
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
    departmentSections(first: 10, departmentId: $departmentId) {
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
  }
`;

export const EMPLOYEE_FOR_EDIT_QUERY = gql`
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
  }
`;

export const UPDATE_EMPLOYEE_MUTATION = gql`
  mutation UpdateEmployee($input: UpdateEmployeeInput!) {
    updateEmployee(input: $input) {
      id
      fullName
    }
  }
`;
