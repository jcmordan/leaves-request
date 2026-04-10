using FluentAssertions;
using LeaveManagement.Application.Services;
using LeaveManagement.Application.Tests.Helpers;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Application.Tests.Services;

public class EmployeeServiceTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly EmployeeService _sut;
    private readonly Guid _departmentId = Guid.NewGuid();

    public EmployeeServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _sut = new EmployeeService(_context);
        SeedData();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private void SeedData()
    {
        _context.Departments.Add(new Department { Id = _departmentId, Name = "HR" });
        _context.SaveChanges();
    }

    [Fact]
    public async Task CreateAsync_DuplicateCode_ShouldThrowException()
    {
        _context.Employees.Add(
            new Employee
            {
                Id = Guid.NewGuid(),
                FullName = "Existing",
                EmployeeCode = "DUP001",
                NationalId = "NID001",
                IsActive = true,
            }
        );
        await _context.SaveChangesAsync();

        var act = () =>
            _sut.CreateAsync(
                "New",
                "new@test.com",
                "DUP001",
                "NID002",
                _departmentId,
                DateTime.UtcNow
            );

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("An employee with the same code or national ID already exists.");
    }

    [Fact]
    public async Task UpdateAsync_DuplicateNationalIdOnAnotherEmployee_ShouldThrowException()
    {
        var targetId = Guid.NewGuid();
        _context.Employees.Add(
            new Employee
            {
                Id = targetId,
                FullName = "Target",
                EmployeeCode = "TGT001",
                NationalId = "NID001",
                IsActive = true,
            }
        );
        _context.Employees.Add(
            new Employee
            {
                Id = Guid.NewGuid(),
                FullName = "Other",
                EmployeeCode = "OTH001",
                NationalId = "NID999",
                IsActive = true,
            }
        );
        await _context.SaveChangesAsync();

        var act = () =>
            _sut.UpdateAsync(
                targetId,
                "Target Updated",
                "tg@test.com",
                "TGT001",
                "NID999",
                _departmentId,
                DateTime.UtcNow,
                true
            );

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("Another employee with the same code or national ID already exists.");
    }

    [Fact]
    public async Task UpdateAsync_ValidUpdate_ShouldSucceed()
    {
        var targetId = Guid.NewGuid();
        var employee = new Employee
        {
            Id = targetId,
            FullName = "Original",
            EmployeeCode = "OLD001",
            NationalId = "NID001",
            IsActive = true,
            DepartmentId = _departmentId,
        };
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        var result = await _sut.UpdateAsync(
            targetId,
            "Updated",
            "new@test.com",
            "NEW001",
            "NID001",
            _departmentId,
            DateTime.UtcNow,
            true
        );

        result.FullName.Should().Be("Updated");
        result.EmployeeCode.Should().Be("NEW001");

        var saved = await _context.Employees.FindAsync(targetId);
        saved!.FullName.Should().Be("Updated");
    }

    [Fact]
    public async Task AssignSupervisorAsync_SelfAssignment_ShouldThrowException()
    {
        var employeeId = Guid.NewGuid();
        var act = () => _sut.AssignSupervisorAsync(employeeId, employeeId);

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("An employee cannot be their own supervisor.");
    }

    [Fact]
    public async Task GetEmployeeStatsAsync_ShouldReturnCorrectNumbers()
    {
        var employee1 = new Employee
        {
            Id = Guid.NewGuid(),
            FullName = "Active 1",
            EmployeeCode = "A1",
            NationalId = "N1",
            IsActive = true,
        };
        var employee2 = new Employee
        {
            Id = Guid.NewGuid(),
            FullName = "Active 2",
            EmployeeCode = "A2",
            NationalId = "N2",
            IsActive = true,
        };
        var employee3 = new Employee
        {
            Id = Guid.NewGuid(),
            FullName = "Inactive",
            EmployeeCode = "I1",
            NationalId = "N3",
            IsActive = false,
        };

        _context.Employees.AddRange(employee1, employee2, employee3);

        var absenceTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(
            new AbsenceType
            {
                Id = absenceTypeId,
                Name = "Vaca",
                IsActive = true,
            }
        );

        // One employee on leave today
        _context.AbsenceRequests.Add(
            new AbsenceRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = employee1.Id,
                AbsenceTypeId = absenceTypeId,
                StartDate = DateTime.UtcNow.AddDays(-1),
                EndDate = DateTime.UtcNow.AddDays(1),
                Status = RequestStatus.Approved,
                RequesterEmployeeId = employee1.Id,
            }
        );

        await _context.SaveChangesAsync();

        var stats = await _sut.GetEmployeeStatsAsync();

        stats.Total.Should().Be(3);
        stats.Active.Should().Be(2);
        stats.Inactive.Should().Be(1);
        stats.OnLeave.Should().Be(1);
    }
}
