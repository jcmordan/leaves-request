using System;

namespace LeaveManagement.Api.GraphQL.InputTypes;

/// <summary>Input for creating a new employee.</summary>
public record CreateEmployeeInput(
    string FullName,
    string Email,
    string EmployeeCode,
    string NationalId,
    Guid DepartmentId,
    DateTime HireDate
);

/// <summary>Input for updating an existing employee.</summary>
public record UpdateEmployeeInput(
    Guid Id,
    string FullName,
    string Email,
    string EmployeeCode,
    string NationalId,
    Guid DepartmentId,
    DateTime HireDate,
    bool IsActive
);
