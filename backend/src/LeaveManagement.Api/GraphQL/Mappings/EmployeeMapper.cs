using System;
using LeaveManagement.Api.GraphQL.InputTypes;
using LeaveManagement.Domain.Models;

namespace LeaveManagement.Api.GraphQL.Mappings;

/// <summary>
/// Static mapper to convert GraphQL input types to Domain models.
/// </summary>
public static class EmployeeMapper
{
    public static EmployeeUpdateData ToDomain(UpdateEmployeeInput input)
    {
        return new EmployeeUpdateData(
            input.Id,
            input.FullName,
            input.Email,
            input.EmployeeCode,
            input.An8,
            input.NationalId,
            input.JobTitleId,
            input.DepartmentId,
            input.DepartmentSectionId,
            input.HireDate,
            input.ManagerId,
            input.CompanyId,
            input.IsActive
        );
    }
}
