using System;
using System.Collections.Generic;
using LeaveManagement.Domain.Enums;

namespace LeaveManagement.Domain.Entities;

public class AbsenceRequest
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid AbsenceTypeId { get; set; }
    public Guid? AbsenceSubTypeId { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public RequestStatus Status { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Diagnosis { get; set; }
    public string? TreatingDoctor { get; set; }
    public int TotalDaysRequested { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid RequesterEmployeeId { get; set; }
    public Employee? RequesterEmployee { get; set; }
    public Employee? Employee { get; set; }
    public AbsenceType? AbsenceType { get; set; }

    public AbsenceType? AbsenceSubType { get; set; }

    public ICollection<Attachment> Attachments { get; set; } = [];
    public ICollection<ApprovalHistory> ApprovalHistories { get; set; } = [];
}
