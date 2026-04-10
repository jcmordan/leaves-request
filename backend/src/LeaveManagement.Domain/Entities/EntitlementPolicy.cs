using System;

namespace LeaveManagement.Domain.Entities;

public class EntitlementPolicy
{
    public Guid Id { get; set; }
    public Guid AbsenceTypeId { get; set; }
    public AbsenceType? AbsenceType { get; set; }
    public int MinTenureYears { get; set; }
    public int EntitlementDays { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
