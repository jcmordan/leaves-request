namespace LeaveManagement.Domain.Entities;

public class JobTitle
{
    public Guid Id { get; set; }
    public string? Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
