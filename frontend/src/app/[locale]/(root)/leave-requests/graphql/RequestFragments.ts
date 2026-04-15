import { graphql } from "@/__generated__";

export const SHARED_BALANCE_FRAGMENT = graphql(`
  fragment Shared_BalanceFields on LeaveBalanceDto {
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

export const SHARED_REQUEST_ITEM_FRAGMENT = graphql(`
  fragment Shared_RequestItemFields on AbsenceRequest {
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
  }
`);
