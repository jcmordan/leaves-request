using System;
using System.Collections.Generic;
using LeaveManagement.Domain.Enums;

namespace LeaveManagement.Domain.Entities;

public class AbsenceType
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CalculationType CalculationType { get; set; }
    public bool RequiresAttachment { get; set; }
    public bool RequiresDoctor { get; set; }
    public int MaxDaysPerYear { get; set; }
    public bool DeductsFromBalance { get; set; }
    public bool IsSellingType { get; set; }
    public int MaxSellableDaysPerYear { get; set; }
    public Guid? ParentId { get; set; }
    public AbsenceType? Parent { get; set; }
    public ICollection<AbsenceType> Children { get; set; } = [];
    public bool IsActive { get; set; } = true;
}
