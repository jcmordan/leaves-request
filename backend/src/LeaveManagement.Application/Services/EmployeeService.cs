using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LeaveManagement.Application.Common.Paging;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
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
        Guid id,
        string fullName,
        string email,
        string employeeCode,
        string nationalId,
        Guid departmentId,
        DateTime hireDate,
        bool isActive,
        CancellationToken cancellationToken = default
    )
    {
        var employee =
            await _context.Employees.FindAsync([id], cancellationToken)
            ?? throw new InvalidOperationException($"Employee {id} not found.");

        var duplicateExists = await _context.Employees.AnyAsync(
            e => e.Id != id && (e.EmployeeCode == employeeCode || e.NationalId == nationalId),
            cancellationToken
        );

        if (duplicateExists)
        {
            throw new InvalidOperationException(
                "Another employee with the same code or national ID already exists."
            );
        }

        employee.FullName = fullName;
        employee.Email = email;
        employee.EmployeeCode = employeeCode;
        employee.NationalId = nationalId;
        employee.DepartmentId = departmentId;
        employee.HireDate = DateTime.SpecifyKind(hireDate, DateTimeKind.Utc);
        employee.IsActive = isActive;

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
                EF.Functions.ILike(e.FullName, $"%{search}%")
                || EF.Functions.ILike(e.EmployeeCode, $"%{search}%")
                || EF.Functions.ILike(e.NationalId, $"%{search}%")
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
    public async Task<IDictionary<Guid, Employee>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default)
    {
        return await _context.Employees
            .Where(e => ids.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id, ct);
    }

    /// <inheritdoc/>
    public async Task<ILookup<Guid, Employee>> GetSubordinatesByEmployeeIdsAsync(IEnumerable<Guid> employeeIds, CancellationToken ct = default)
    {
        var subordinates = await _context.Employees
            .Join(_context.EmployeeSupervisors,
                  e => e.Id,
                  es => es.EmployeeId,
                  (e, es) => new { Employee = e, SupervisorId = es.SupervisorId })
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
