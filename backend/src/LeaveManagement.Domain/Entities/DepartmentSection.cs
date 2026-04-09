namespace LeaveManagement.Domain.Entities;

public class DepartmentSection
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public Guid DepartmentId { get; set; }
    public Department? Department { get; set; }
}