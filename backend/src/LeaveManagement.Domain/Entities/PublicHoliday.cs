using System;

namespace LeaveManagement.Domain.Entities;

public class PublicHoliday
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
}
