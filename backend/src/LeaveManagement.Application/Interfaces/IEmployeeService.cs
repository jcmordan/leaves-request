using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Application.Interfaces;

/// <summary>Employee management operations.</summary>
public interface IEmployeeService
{
    Task<Employee> CreateAsync(
        string firstName,
        string lastName,
        string email,
        string employeeCode,
        string nationalId,
        Guid departmentId,
        DateTime hireDate,
        string role,
        CancellationToken ct = default);

    Task<Employee> UpdateAsync(
        Guid id,
        string firstName,
        string lastName,
        string email,
        string employeeCode,
        string nationalId,
        Guid departmentId,
        DateTime hireDate,
        string role,
        bool isActive,
        CancellationToken ct = default);

    Task<bool> DeactivateAsync(Guid id, CancellationToken ct = default);

    Task<EmployeeSupervisor> AssignSupervisorAsync(
        Guid employeeId,
        Guid supervisorId,
        CancellationToken ct = default);

    Task<bool> RemoveSupervisorAsync(Guid employeeId, CancellationToken ct = default);
}
