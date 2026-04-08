using LeaveManagement.Domain.Enums;

namespace LeaveManagement.Domain.Entities;

public class User
{
    public Guid Id { get; set; }

    /// <summary>
    /// The unique identifier from the external identity provider (e.g., EntraID).
    /// Optional for local users.
    /// </summary>
    public string? ExternalId { get; set; }

    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// The hashed password for local users.
    /// Optional for external users.
    /// </summary>
    public string? PasswordHash { get; set; }

    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Employee;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
