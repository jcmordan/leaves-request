using System.Threading;
using System.Threading.Tasks;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Models;

namespace LeaveManagement.Application.Interfaces;

/// <summary>Employee management operations.</summary>
public interface IEmployeeService
{
    Task<Employee> CreateAsync(
        string fullName,
        string email,
        string employeeCode,
        string nationalId,
        Guid departmentId,
        DateOnly hireDate,
        CancellationToken ct = default
    );

    Task<Employee> UpdateAsync(
        EmployeeUpdateData data,
        CancellationToken ct = default
    );

    Task<bool> DeactivateAsync(Guid id, CancellationToken ct = default);

    Task<EmployeeSupervisor> AssignSupervisorAsync(
        Guid employeeId,
        Guid supervisorId,
        CancellationToken ct = default
    );

    Task<bool> RemoveSupervisorAsync(Guid employeeId, CancellationToken ct = default);

    /// <summary>Returns a paged collection of all employees.</summary>
    Task<PaginationResult<Employee>> GetEmployeesAsync(PaginationFilter filter, string? search);

    /// <summary>Returns a single employee by ID.</summary>
    Task<Employee?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Returns employees by their IDs for batch loading.</summary>
    Task<IDictionary<Guid, Employee>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default);

    /// <summary>Returns subordinates for a set of employee IDs.</summary>
    Task<ILookup<Guid, Employee>> GetSubordinatesByEmployeeIdsAsync(IEnumerable<Guid> employeeIds, CancellationToken ct = default);

    /// <summary>Returns statistics about employees.</summary>
    Task<EmployeeStats> GetEmployeeStatsAsync();
}
