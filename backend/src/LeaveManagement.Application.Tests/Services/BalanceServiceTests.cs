using FluentAssertions;
using LeaveManagement.Application.Services;
using LeaveManagement.Application.Tests.Helpers;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Infrastructure.Data;

namespace LeaveManagement.Application.Tests.Services;

public class BalanceServiceTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly BalanceService _sut;
    private readonly Guid _employeeId = Guid.NewGuid();
    private readonly Guid _absenceTypeId = Guid.NewGuid();
    private readonly Guid _departmentId = Guid.NewGuid();

    public BalanceServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _sut = new BalanceService(_context);
        SeedBaseData();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private void SeedBaseData()
    {
        _context.Departments.Add(new Department { Id = _departmentId, Name = "Engineering" });

        _context.Employees.Add(
            new Employee
            {
                Id = _employeeId,
                FullName = "John Doe",
                EmployeeCode = "EMP001",
                NationalId = "12345",
                DepartmentId = _departmentId,
                HireDate = new DateOnly(2020, 1, 1),
                IsActive = true,
            }
        );

        _context.AbsenceTypes.Add(
            new AbsenceType
            {
                Id = _absenceTypeId,
                Name = "Vacation",
                DeductsFromBalance = true,
                IsActive = true,
                CalculationType = CalculationType.WorkingDays,
            }
        );

        _context.SaveChanges();
    }

    [Fact]
    public async Task GetEmployeeBalanceAsync_WithEntitlement_ShouldReturnCorrectBalance()
    {
        _context.LeaveEntitlements.Add(
            new LeaveEntitlement
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                Year = 2026,
                BaseDays = 20,
                AdditionalDays = 0,
                CarryOverDays = 0,
            }
        );
        await _context.SaveChangesAsync();

        var result = await _sut.GetEmployeeBalanceAsync(_employeeId, 2026, _absenceTypeId);

        result.TotalEntitlement.Should().Be(20);
        result.Taken.Should().Be(0);
        result.Remaining.Should().Be(20);
    }

    [Fact]
    public async Task GetEmployeeBalanceAsync_WithApprovedRequests_ShouldDeductFromBalance()
    {
        _context.LeaveEntitlements.Add(
            new LeaveEntitlement
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                Year = 2026,
                BaseDays = 20,
                AdditionalDays = 0,
                CarryOverDays = 0,
            }
        );

        _context.AbsenceRequests.Add(
            new AbsenceRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                StartDate = new DateOnly(2026, 3, 1),
                EndDate = new DateOnly(2026, 3, 5),
                Status = RequestStatus.Approved,
                TotalDaysRequested = 5,
                Reason = "Vacation",
                RequesterEmployeeId = _employeeId,
            }
        );
        await _context.SaveChangesAsync();

        var result = await _sut.GetEmployeeBalanceAsync(_employeeId, 2026, _absenceTypeId);

        result.TotalEntitlement.Should().Be(20);
        result.Taken.Should().Be(5);
        result.Remaining.Should().Be(15);
    }

    [Fact]
    public async Task GetEmployeeBalanceAsync_PendingRequests_ShouldNotDeduct()
    {
        _context.LeaveEntitlements.Add(
            new LeaveEntitlement
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                Year = 2026,
                BaseDays = 20,
                AdditionalDays = 0,
                CarryOverDays = 0,
            }
        );

        _context.AbsenceRequests.Add(
            new AbsenceRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                StartDate = new DateOnly(2026, 3, 1),
                EndDate = new DateOnly(2026, 3, 5),
                Status = RequestStatus.Pending,
                TotalDaysRequested = 5,
                Reason = "Vacation",
                RequesterEmployeeId = _employeeId,
            }
        );
        await _context.SaveChangesAsync();

        var result = await _sut.GetEmployeeBalanceAsync(_employeeId, 2026, _absenceTypeId);

        result.Taken.Should().Be(0);
        result.Remaining.Should().Be(20);
    }

    [Fact]
    public async Task GetEmployeeBalanceAsync_EmployeeNotFound_ShouldThrow()
    {
        var act = async () =>
            await _sut.GetEmployeeBalanceAsync(Guid.NewGuid(), 2026, _absenceTypeId);

        await act.Should().ThrowAsync<Exception>().WithMessage("Employee not found.");
    }

    [Fact]
    public async Task AccruedDaysForYearAsync_WithExplicitEntitlement_ShouldReturnEntitlementDays()
    {
        _context.LeaveEntitlements.Add(
            new LeaveEntitlement
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                Year = 2026,
                BaseDays = 25,
                AdditionalDays = 2,
                CarryOverDays = 3,
            }
        );
        await _context.SaveChangesAsync();

        var result = await _sut.AccruedDaysForYearAsync(_employeeId, 2026, _absenceTypeId);

        result.Should().Be(30); // 25 + 2 + 3
    }

    [Fact]
    public async Task AccruedDaysForYearAsync_WithPolicy_ShouldFallbackToPolicy()
    {
        _context.EntitlementPolicies.Add(
            new EntitlementPolicy
            {
                Id = Guid.NewGuid(),
                AbsenceTypeId = _absenceTypeId,
                MinTenureYears = 0,
                EntitlementDays = 15,
                IsActive = true,
            }
        );
        _context.EntitlementPolicies.Add(
            new EntitlementPolicy
            {
                Id = Guid.NewGuid(),
                AbsenceTypeId = _absenceTypeId,
                MinTenureYears = 5,
                EntitlementDays = 20,
                IsActive = true,
            }
        );
        await _context.SaveChangesAsync();

        // Employee hired 2020-01-01, reference 2026-04-09 => 6 years tenure
        var result = await _sut.AccruedDaysForYearAsync(
            _employeeId,
            2026,
            _absenceTypeId,
            new DateOnly(2026, 4, 9)
        );

        result.Should().Be(20); // 6 years tenure >= 5 min tenure
    }

    [Fact]
    public async Task AccruedDaysForYearAsync_NoEntitlementOrPolicy_ShouldReturnZero()
    {
        var result = await _sut.AccruedDaysForYearAsync(_employeeId, 2026, _absenceTypeId);

        result.Should().Be(0);
    }

    [Fact]
    public async Task AccruedDaysForYearAsync_EmployeeNotFound_ShouldThrow()
    {
        var act = async () =>
            await _sut.AccruedDaysForYearAsync(Guid.NewGuid(), 2026, _absenceTypeId);

        await act.Should().ThrowAsync<Exception>().WithMessage("Employee not found.");
    }

    [Fact]
    public async Task GetEmployeeBalanceSummaryAsync_ShouldAggregateAcrossTypes()
    {
        var secondTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(
            new AbsenceType
            {
                Id = secondTypeId,
                Name = "Sick Leave",
                DeductsFromBalance = true,
                IsActive = true,
                CalculationType = CalculationType.WorkingDays,
            }
        );

        _context.LeaveEntitlements.Add(
            new LeaveEntitlement
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                Year = 2026,
                BaseDays = 20,
                AdditionalDays = 0,
                CarryOverDays = 0,
            }
        );
        _context.LeaveEntitlements.Add(
            new LeaveEntitlement
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = secondTypeId,
                Year = 2026,
                BaseDays = 10,
                AdditionalDays = 0,
                CarryOverDays = 0,
            }
        );

        _context.AbsenceRequests.Add(
            new AbsenceRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                StartDate = new DateOnly(2026, 2, 1),
                EndDate = new DateOnly(2026, 2, 5),
                Status = RequestStatus.Approved,
                TotalDaysRequested = 5,
                Reason = "Trip",
                RequesterEmployeeId = _employeeId,
            }
        );
        await _context.SaveChangesAsync();

        var result = await _sut.GetEmployeeBalanceSummaryAsync(_employeeId, 2026);

        result.TotalEntitlement.Should().Be(30); // 20 + 10
        result.Taken.Should().Be(5);
        result.Remaining.Should().Be(25);
    }

    [Fact]
    public async Task GetEmployeeBalanceSummaryAsync_InactiveTypes_ShouldBeExcluded()
    {
        var inactiveTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(
            new AbsenceType
            {
                Id = inactiveTypeId,
                Name = "Inactive Type",
                DeductsFromBalance = true,
                IsActive = false,
                CalculationType = CalculationType.WorkingDays,
            }
        );

        _context.LeaveEntitlements.Add(
            new LeaveEntitlement
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                Year = 2026,
                BaseDays = 20,
                AdditionalDays = 0,
                CarryOverDays = 0,
            }
        );
        _context.LeaveEntitlements.Add(
            new LeaveEntitlement
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = inactiveTypeId,
                Year = 2026,
                BaseDays = 99,
                AdditionalDays = 0,
                CarryOverDays = 0,
            }
        );
        await _context.SaveChangesAsync();

        var result = await _sut.GetEmployeeBalanceSummaryAsync(_employeeId, 2026);

        // Only the active type's entitlement should be counted
        result.TotalEntitlement.Should().Be(20);
    }
    [Fact]
    public async Task GetEmployeeBalanceAsync_WithSellingRequests_ShouldAggregrateUsage()
    {
        // Arrange: Parent type (Vacation) + Selling type (Sell Vacation)
        var sellingTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(
            new AbsenceType
            {
                Id = sellingTypeId,
                Name = "Sell Vacation",
                ParentId = _absenceTypeId,
                IsSellingType = true,
                IsActive = true,
                DeductsFromBalance = true,
            }
        );

        _context.LeaveEntitlements.Add(
            new LeaveEntitlement
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                Year = 2026,
                BaseDays = 20,
            }
        );

        // Add some "Taken" vacation (3 days)
        _context.AbsenceRequests.Add(
            new AbsenceRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                StartDate = new DateOnly(2026, 3, 1),
                EndDate = new DateOnly(2026, 3, 3),
                Status = RequestStatus.Approved,
                TotalDaysRequested = 3,
                RequesterEmployeeId = _employeeId,
            }
        );

        // Add some "Sold" vacation (2 days)
        _context.AbsenceRequests.Add(
            new AbsenceRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = sellingTypeId,
                StartDate = new DateOnly(2026, 3, 4),
                EndDate = new DateOnly(2026, 3, 4),
                Status = RequestStatus.Approved,
                TotalDaysRequested = 2,
                RequesterEmployeeId = _employeeId,
            }
        );

        await _context.SaveChangesAsync();

        // Act: Get balance for Vacation (parent)
        var result = await _sut.GetEmployeeBalanceAsync(_employeeId, 2026, _absenceTypeId);

        // Assert: Total Taken should be 5 (3 taken + 2 sold)
        result.TotalEntitlement.Should().Be(20);
        result.Taken.Should().Be(5);
        result.Remaining.Should().Be(15);
    }
}
