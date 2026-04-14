import { graphql } from "@/__generated__";
import { SHARED_BALANCE_FRAGMENT } from "./RequestFragments";

export const CANCEL_REQUEST_MUTATION = graphql(`
  mutation Shared_CancelMutation($input: CancelLeaveRequestInput!) {
    cancelLeaveRequest(input: $input) {
      request {
        id
        status
      }
      balance {
        ...Shared_BalanceFields
      }
    }
  }
`);
