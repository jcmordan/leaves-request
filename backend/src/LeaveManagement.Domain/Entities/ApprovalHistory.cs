using System;
using LeaveManagement.Domain.Enums;

namespace LeaveManagement.Domain.Entities;

public class ApprovalHistory
{
    public Guid Id { get; set; }
    public Guid AbsenceRequestId { get; set; }
    public Guid ApproverEmployeeId { get; set; }
    public Employee? Approver { get; set; }
    public ApprovalAction Action { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime ActionDate { get; set; }
    public RequestStatus StatusAfterAction { get; set; }

    public AbsenceRequest? AbsenceRequest { get; set; }
}
