using System;
using System.Threading;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Types;
using LeaveManagement.Api.GraphQL.InputTypes;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Api.GraphQL.Mutations;

[ExtendObjectType(typeof(Mutation))]
public class EmployeeMutations
{
    /// <summary>Creates a new employee record.</summary>
    public async Task<Employee> CreateEmployee(
        [Service] IEmployeeService employeeService,
        CreateEmployeeInput input,
        CancellationToken ct
    )
    {
        return await employeeService.CreateAsync(
            input.FirstName,
            input.LastName,
            input.Email,
            input.EmployeeCode,
            input.NationalId,
            input.DepartmentId,
            input.HireDate,
            ct);
    }

    /// <summary>Updates an existing employee record.</summary>
    public async Task<Employee> UpdateEmployee(
        [Service] IEmployeeService employeeService,
        UpdateEmployeeInput input,
        CancellationToken ct
    )
    {
        return await employeeService.UpdateAsync(
            input.Id,
            input.FirstName,
            input.LastName,
            input.Email,
            input.EmployeeCode,
            input.NationalId,
            input.DepartmentId,
            input.HireDate,
            input.IsActive,
            ct);
    }

    /// <summary>Soft-deletes an employee by marking them inactive.</summary>
    public async Task<bool> DeactivateEmployee(
        [Service] IEmployeeService employeeService,
        Guid id,
        CancellationToken ct
    )
    {
        return await employeeService.DeactivateAsync(id, ct);
    }

    // ── Supervisor Assignment ──────────────────────────────────────────────

    /// <summary>Assigns or replaces the direct supervisor for an employee.</summary>
    public async Task<EmployeeSupervisor> AssignSupervisor(
        [Service] IEmployeeService employeeService,
        Guid employeeId,
        Guid supervisorId,
        CancellationToken ct
    )
    {
        return await employeeService.AssignSupervisorAsync(employeeId, supervisorId, ct);
    }

    /// <summary>Removes the supervisor relationship for an employee.</summary>
    public async Task<bool> RemoveSupervisor(
        [Service] IEmployeeService employeeService,
        Guid employeeId,
        CancellationToken ct
    )
    {
        return await employeeService.RemoveSupervisorAsync(employeeId, ct);
    }
}
