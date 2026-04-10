import { graphql } from "@/__generated__";

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
