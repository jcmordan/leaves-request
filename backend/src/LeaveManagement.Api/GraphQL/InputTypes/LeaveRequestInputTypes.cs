using System;

namespace LeaveManagement.Api.GraphQL.InputTypes;

/// <summary>Input for submitting a new leave request.</summary>
public record SubmitLeaveRequestInput(
    Guid AbsenceTypeId,
    DateTime StartDate,
    DateTime EndDate,
    string Reason,
    Guid? AbsenceSubTypeId = null,
    string? Diagnosis = null,
    string? TreatingDoctor = null,
    HotChocolate.Types.IFile? File = null);

/// <summary>Input for approving a leave request.</summary>
public record ApproveLeaveRequestInput(Guid RequestId, string Comment);

/// <summary>Input for rejecting a leave request.</summary>
public record RejectLeaveRequestInput(Guid RequestId, string Comment);

/// <summary>Input for cancelling a leave request.</summary>
public record CancelLeaveRequestInput(Guid RequestId, string Reason);
