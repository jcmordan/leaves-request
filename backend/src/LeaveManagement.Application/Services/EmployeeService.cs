using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LeaveManagement.Application.Common.Paging;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Domain.Models;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Application.Services;

/// <summary>Concrete employee management service.</summary>
public sealed class EmployeeService(LeaveManagementDbContext context) : IEmployeeService
{
    private readonly LeaveManagementDbContext _context = context;

    public async Task<Employee> CreateAsync(
        string fullName,
        string email,
        string employeeCode,
        string nationalId,
        Guid departmentId,
        DateTime hireDate,
        CancellationToken cancellationToken = default
    )
    {
        var exists = await _context.Employees.AnyAsync(
            e => e.EmployeeCode == employeeCode || e.NationalId == nationalId,
            cancellationToken
        );

        if (exists)
        {
            throw new InvalidOperationException(
                "An employee with the same code or national ID already exists."
            );
        }

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            Email = email,
            EmployeeCode = employeeCode,
            NationalId = nationalId,
            DepartmentId = departmentId,
            HireDate = DateTime.SpecifyKind(hireDate, DateTimeKind.Utc),
            IsActive = true,
        };

        await _context.Employees.AddAsync(employee, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return employee;
    }

    public async Task<Employee> UpdateAsync(
        EmployeeUpdateData data,
        CancellationToken cancellationToken = default
    )
    {
        var employee =
            await _context.Employees.FindAsync([data.Id], cancellationToken)
            ?? throw new InvalidOperationException($"Employee {data.Id} not found.");

        var duplicateExists = await _context.Employees.AnyAsync(
            e =>
                e.Id != data.Id
                && (
                    e.EmployeeCode == data.EmployeeCode
                    || e.NationalId == data.NationalId
                    || (data.Email != null && e.Email == data.Email)
                ),
            cancellationToken
        );

        if (duplicateExists)
        {
            throw new InvalidOperationException(
                "Another employee with the same code, national ID, or email already exists."
            );
        }

        employee.FullName = data.FullName;
        employee.Email = data.Email;
        employee.EmployeeCode = data.EmployeeCode;
        employee.AN8 = data.AN8;
        employee.NationalId = data.NationalId;
        employee.JobTitleId = data.JobTitleId;
        employee.DepartmentId = data.DepartmentId;
        employee.DepartmentSectionId = data.DepartmentSectionId;
        employee.HireDate = DateTime.SpecifyKind(data.HireDate, DateTimeKind.Utc);
        employee.ManagerId = data.ManagerId;
        employee.CompanyId = data.CompanyId;
        employee.IsActive = data.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return employee;
    }

    public async Task<bool> DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var employee =
            await _context.Employees.FindAsync([id], cancellationToken)
            ?? throw new InvalidOperationException($"Employee {id} not found.");

        employee.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<EmployeeSupervisor> AssignSupervisorAsync(
        Guid employeeId,
        Guid supervisorId,
        CancellationToken cancellationToken = default
    )
    {
        if (employeeId == supervisorId)
        {
            throw new InvalidOperationException("An employee cannot be their own supervisor.");
        }

        var existing = await _context.EmployeeSupervisors.FirstOrDefaultAsync(
            es => es.EmployeeId == employeeId,
            cancellationToken
        );

        if (existing != null)
        {
            existing.SupervisorId = supervisorId;
            await _context.SaveChangesAsync(cancellationToken);

            return existing;
        }

        var assignment = new EmployeeSupervisor
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            SupervisorId = supervisorId,
        };

        await _context.EmployeeSupervisors.AddAsync(assignment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return assignment;
    }

    public async Task<bool> RemoveSupervisorAsync(
        Guid employeeId,
        CancellationToken cancellationToken = default
    )
    {
        var assignment = await _context.EmployeeSupervisors.FirstOrDefaultAsync(
            es => es.EmployeeId == employeeId,
            cancellationToken
        );

        if (assignment == null)
        {
            return false;
        }

        _context.EmployeeSupervisors.Remove(assignment);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    /// <inheritdoc/>
    public async Task<PaginationResult<Employee>> GetEmployeesAsync(
        PaginationFilter filter,
        string? search
    )
    {
        IQueryable<Employee> query = _context.Employees;

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(e =>
                e.FullName.ToLower().Contains(search.ToLower())
                || e.EmployeeCode.ToLower().Contains(search.ToLower())
                || e.NationalId.ToLower().Contains(search.ToLower())
            );
        }

        return await PagingHelper.ApplyPagingAsync(query, filter);
    }

    /// <inheritdoc/>
    public async Task<Employee?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Employees.FindAsync([id], ct);
    }

    /// <inheritdoc/>
    public async Task<IDictionary<Guid, Employee>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken ct = default
    )
    {
        return await _context
            .Employees.Where(e => ids.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id, ct);
    }

    /// <inheritdoc/>
    public async Task<ILookup<Guid, Employee>> GetSubordinatesByEmployeeIdsAsync(
        IEnumerable<Guid> employeeIds,
        CancellationToken ct = default
    )
    {
        var subordinates = await _context
            .Employees.Join(
                _context.EmployeeSupervisors,
                e => e.Id,
                es => es.EmployeeId,
                (e, es) => new { Employee = e, SupervisorId = es.SupervisorId }
            )
            .Where(x => employeeIds.Contains(x.SupervisorId))
            .ToListAsync(ct);

        return subordinates.ToLookup(x => x.SupervisorId, x => x.Employee);
    }

    public async Task<EmployeeStats> GetEmployeeStatsAsync()
    {
        var totalEmployees = await _context.Employees.CountAsync();
        var activeEmployees = await _context.Employees.CountAsync(e => e.IsActive);
        var inactiveEmployees = totalEmployees - activeEmployees;

        var onLeaveEmployees = await _context
            .AbsenceRequests.Where(lr =>
                lr.StartDate <= DateTime.UtcNow && lr.EndDate >= DateTime.UtcNow
            )
            .Where(lr => lr.Status == RequestStatus.Approved)
            .CountAsync();

        return new EmployeeStats(
            totalEmployees,
            activeEmployees,
            inactiveEmployees,
            onLeaveEmployees
        );
    }
}
