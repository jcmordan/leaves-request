using System;
using System.Threading;
using System.Threading.Tasks;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Application.Services;

/// <summary>Concrete employee management service.</summary>
public sealed class EmployeeService : IEmployeeService
{
    private readonly LeaveManagementDbContext _context;

    public EmployeeService(LeaveManagementDbContext context)
    {
        _context = context;
    }

    public async Task<Employee> CreateAsync(
        string firstName,
        string lastName,
        string email,
        string employeeCode,
        string nationalId,
        Guid departmentId,
        DateTime hireDate,
        string role,
        CancellationToken ct = default)
    {
        var exists = await _context.Employees.AnyAsync(
            e => e.EmployeeCode == employeeCode || e.NationalId == nationalId,
            ct);

        if (exists)
        {
            throw new InvalidOperationException("An employee with the same code or national ID already exists.");
        }

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            EmployeeCode = employeeCode,
            NationalId = nationalId,
            DepartmentId = departmentId,
            HireDate = DateTime.SpecifyKind(hireDate, DateTimeKind.Utc),
            Role = role,
            IsActive = true,
        };

        await _context.Employees.AddAsync(employee, ct);
        await _context.SaveChangesAsync(ct);

        return employee;
    }

    public async Task<Employee> UpdateAsync(
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
        CancellationToken ct = default)
    {
        var employee = await _context.Employees.FindAsync([id], ct)
            ?? throw new InvalidOperationException($"Employee {id} not found.");

        var duplicateExists = await _context.Employees.AnyAsync(
            e => e.Id != id && (e.EmployeeCode == employeeCode || e.NationalId == nationalId),
            ct);

        if (duplicateExists)
        {
            throw new InvalidOperationException("Another employee with the same code or national ID already exists.");
        }

        employee.FirstName = firstName;
        employee.LastName = lastName;
        employee.Email = email;
        employee.EmployeeCode = employeeCode;
        employee.NationalId = nationalId;
        employee.DepartmentId = departmentId;
        employee.HireDate = DateTime.SpecifyKind(hireDate, DateTimeKind.Utc);
        employee.Role = role;
        employee.IsActive = isActive;

        await _context.SaveChangesAsync(ct);

        return employee;
    }

    public async Task<bool> DeactivateAsync(Guid id, CancellationToken ct = default)
    {
        var employee = await _context.Employees.FindAsync([id], ct)
            ?? throw new InvalidOperationException($"Employee {id} not found.");

        employee.IsActive = false;
        await _context.SaveChangesAsync(ct);

        return true;
    }

    public async Task<EmployeeSupervisor> AssignSupervisorAsync(
        Guid employeeId,
        Guid supervisorId,
        CancellationToken ct = default)
    {
        if (employeeId == supervisorId)
        {
            throw new InvalidOperationException("An employee cannot be their own supervisor.");
        }

        var existing = await _context.EmployeeSupervisors
            .FirstOrDefaultAsync(es => es.EmployeeId == employeeId, ct);

        if (existing != null)
        {
            existing.SupervisorId = supervisorId;
            await _context.SaveChangesAsync(ct);

            return existing;
        }

        var assignment = new EmployeeSupervisor
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            SupervisorId = supervisorId,
        };

        await _context.EmployeeSupervisors.AddAsync(assignment, ct);
        await _context.SaveChangesAsync(ct);

        return assignment;
    }

    public async Task<bool> RemoveSupervisorAsync(Guid employeeId, CancellationToken ct = default)
    {
        var assignment = await _context.EmployeeSupervisors
            .FirstOrDefaultAsync(es => es.EmployeeId == employeeId, ct);

        if (assignment == null)
        {
            return false;
        }

        _context.EmployeeSupervisors.Remove(assignment);
        await _context.SaveChangesAsync(ct);

        return true;
    }
}
