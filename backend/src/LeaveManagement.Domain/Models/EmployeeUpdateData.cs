using System;

namespace LeaveManagement.Domain.Models;

/// <summary>
/// Data record for updating an employee's state, matching the Employee entity's types and nullability.
/// </summary>
public record EmployeeUpdateData(
    Guid Id,
    string FullName,
    string? Email,
    string EmployeeCode,
    string AN8,
    string NationalId,
    Guid? JobTitleId,
    Guid DepartmentId,
    Guid? DepartmentSectionId,
    DateOnly HireDate,
    Guid? ManagerId,
    Guid CompanyId,
    bool IsActive
);
