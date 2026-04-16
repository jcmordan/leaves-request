import { graphql } from "@/__generated__";

export const APPROVAL_REQUEST_FIELDS_FRAGMENT = graphql(`
  fragment ApprovalRequest_Fields on AbsenceRequest {
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

export const ABSENCE_ANALYSIS_OVERLAPS_FRAGMENT = graphql(`
  fragment AbsenceAnalysis_Overlaps on LeaveRequestSummary {
    overlappingAbsences {
      employeeName
      jobTitle
      startDate
      endDate
    }
  }
`);

export const ABSENCE_ANALYSIS_STATS_FRAGMENT = graphql(`
  fragment AbsenceAnalysis_Stats on LeaveRequestSummary {
    availablePercentage
    totalTeamMembers
    membersOnLeave
    pendingMembersOnLeave
  }
`);


export const GET_APPROVAL_DETAIL_QUERY = graphql(`
  query GetApprovalDetail($id: UUID!) {
    request(id: $id) {
      id
      status
      ...ApprovalRequest_Fields
    }
    leaveRequestSummary {
      ...AbsenceAnalysis_Overlaps
      ...AbsenceAnalysis_Stats
    }
  }
`);

export const APPROVE_REQUEST_MUTATION = graphql(`
  mutation Approval_ApproveRequest($input: ApproveLeaveRequestInput!) {
    approveLeaveRequest(input: $input) {
      request {
        id
        status
        ...ApprovalRequest_Fields
      }
    }
  }
`);

export const REJECT_REQUEST_MUTATION = graphql(`
  mutation Approval_RejectRequest($input: RejectLeaveRequestInput!) {
    rejectLeaveRequest(input: $input) {
      request {
        id
        status
        ...ApprovalRequest_Fields
      }
    }
  }
`);
