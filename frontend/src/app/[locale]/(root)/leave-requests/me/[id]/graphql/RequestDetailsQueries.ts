import { graphql } from "@/__generated__";

export const REQUEST_DETAIL_FRAGMENT = graphql(`
  fragment RequestDetails_Fields on AbsenceRequest {
    ...Shared_RequestItemFields
    id
    startDate
    endDate
    status
    reason
    diagnosis
    treatingDoctor
    totalDaysRequested
    createdAt
    absenceType {
      id
      name
    }
    employee {
      id
      fullName
      jobTitle {
        name
      }
      manager {
        id
        fullName
        jobTitle {
          name
        }
      }
    }
    requesterEmployee {
      id
      fullName
    }
    attachments {
      id
      fileName
      fileSize
      uploadedAt
    }
    approvalHistories {
      id
      action
      comment
      actionDate
      statusAfterAction
      approver {
        id
        fullName
      }
    }
  }
`);

export const GET_REQUEST_DETAIL_QUERY = graphql(`
  query RequestDetails_GetRequest($id: UUID!) {
    request(id: $id) {
      id
      status
      ...RequestDetails_Fields
    }
  }
`);
