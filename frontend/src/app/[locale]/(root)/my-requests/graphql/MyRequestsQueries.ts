import { graphql } from "@/__generated__";

export const MY_BALANCE_FRAGMENT = graphql(`
  fragment MyRequests_BalanceFields on LeaveBalanceDto {
    id
    employeeId
    totalEntitlement
    taken
    remaining
    availablePercentage
    totalRequests
    pendingRequests
    approvedRequests
    rejectedRequests
    cancelledRequests
  }
`);

export const MY_REQUEST_ITEM_FRAGMENT = graphql(`
  fragment MyRequests_ItemFields on AbsenceRequest {
    id
    startDate
    endDate
    status
    reason
    createdAt
    absenceType {
      id
      name
    }
    employee {
      id
      fullName
    }
    requesterEmployee {
      id
      fullName
    }
  }
`);

export const MY_REQUESTS_CONNECTION_FRAGMENT = graphql(`
  fragment MyRequests_ConnectionFields on MyRequestsConnection {
    nodes {
      ...MyRequests_ItemFields
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
`);

export const MY_REQUESTS_QUERY = graphql(`
  query MyRequests_GetMyRequests(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $status: RequestStatus
  ) {
    myBalance {
      ...MyRequests_BalanceFields
    }
    myRequests(
      first: $first
      after: $after
      last: $last
      before: $before
      status: $status
    ) {
      ...MyRequests_ConnectionFields
    }
  }
`);

export const CANCEL_REQUEST_MUTATION = graphql(`
  mutation MyRequests_CancelMutation($input: CancelLeaveRequestInput!) {
    cancelLeaveRequest(input: $input) {
      request {
        id
        status
      }
      balance {
        ...MyRequests_BalanceFields
      }
    }
  }
`);



export const SUBMIT_LEAVE_REQUEST_MUTATION = graphql(`
  mutation MyRequests_SubmitMutation($input: SubmitLeaveRequestInput!) {
    submitLeaveRequest(input: $input) {
      request {
        ...MyRequests_ItemFields
      }
      balance {
        ...MyRequests_BalanceFields
      }
    }
  }
`);

export const ABSENCE_TYPES_QUERY_FRAGMENT = graphql(`
  fragment MyRequests_TypeFields on AbsenceTypesConnection {
    nodes {
      id
      parentId
      name
      requiresAttachment
      requiresDoctor
      deductsFromBalance
      calculationType
      maxDaysPerYear
    }
  }
`);

export const SUBMIT_LEAVE_REQUEST_QUERY = graphql(`
  query MyRequests_GetAbsenceTypesForForm($year: Int!) {
    absenceTypes(first: 20) {
      ...MyRequests_TypeFields
    }
    publicHolidays(year: $year) {
      id
      date
      name
    }
  }
`);
