using System;

namespace LeaveManagement.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string ActiveDirectoryObjectId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
