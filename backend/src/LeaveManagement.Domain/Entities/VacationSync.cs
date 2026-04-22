using System;

namespace LeaveManagement.Domain.Entities;

/// <summary>
/// Represents a record for vacation synchronization when a request is approved.
/// </summary>
public class VacationSync
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int TotalDays { get; set; }

    /// <summary>
    /// Type of vacation synchronization.
    /// 0 = Enjoy (Standard Vacation), 1 = Sell (Vacation Selling)
    /// </summary>
    public int Type { get; set; }
    public DateTime CreatedAt { get; set; }
}
