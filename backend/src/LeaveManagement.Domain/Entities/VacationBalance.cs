using System;

namespace LeaveManagement.Domain.Entities;

public class VacationBalance
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public int Year { get; set; }
    public int TotalDays { get; set; }
    public int UsedDays { get; set; }
    public int CarriedOverDays { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int RemainingDays => (TotalDays + CarriedOverDays) - UsedDays;
}
