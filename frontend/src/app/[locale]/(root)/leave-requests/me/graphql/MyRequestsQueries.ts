import { graphql } from "@/__generated__";
import { SHARED_BALANCE_FRAGMENT } from "../../shared/graphql/RequestFragments";
import { CANCEL_REQUEST_MUTATION } from "../../shared/graphql/RequestMutations";

export { SHARED_BALANCE_FRAGMENT as MY_BALANCE_FRAGMENT };
export { CANCEL_REQUEST_MUTATION };

export const MY_REQUESTS_QUERY = graphql(`
  query MyRequests_GetMyRequests(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $status: RequestStatus
  ) {
    myBalance {
      ...Shared_BalanceFields
    }
    myRequests(
      first: $first
      after: $after
      last: $last
      before: $before
      status: $status
    ) {
      ...RequestList_ConnectionFields
    }
  }
`);

export const SUBMIT_LEAVE_REQUEST_MUTATION = graphql(`
  mutation MyRequests_SubmitMutation($input: SubmitLeaveRequestInput!) {
    submitLeaveRequest(input: $input) {
      request {
        ...RequestList_ItemFields
      }
      balance {
        ...Shared_BalanceFields
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
      isSellingType
    }
  }
`);

export const SUBMIT_LEAVE_REQUEST_QUERY = graphql(`
  query MyRequests_GetAbsenceTypesForForm($year: Int!) {
    absenceTypes(first: 20) {
      nodes {
        id
        requiresAttachment
        requiresDoctor
      }
      ...MyRequests_TypeFields
    }
    publicHolidays(year: $year) {
      id
      date
      name
    }
  }
`);
