using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using GreenDonut;
using LeaveManagement.Api.GraphQL.DataLoaders;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.DataLoaders;

public class LeaveBalanceDataLoaderTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory;
    private readonly IBatchScheduler _batchScheduler;
    private readonly DataLoaderOptions _dataLoaderOptions;
    private readonly DbContextOptions<LeaveManagementDbContext> _contextOptions;

    public LeaveBalanceDataLoaderTests()
    {
        _contextOptions = new DbContextOptionsBuilder<LeaveManagementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new LeaveManagementDbContext(_contextOptions);
        _context.Database.EnsureCreated();

        _dbContextFactory = new TestDbContextFactory(_contextOptions);
        _batchScheduler = Substitute.For<IBatchScheduler>();
        _dataLoaderOptions = new DataLoaderOptions();
    }

    private class TestDbContextFactory(DbContextOptions<LeaveManagementDbContext> options) 
        : IDbContextFactory<LeaveManagementDbContext>
    {
        public LeaveManagementDbContext CreateDbContext() => new(options);
        public Task<LeaveManagementDbContext> CreateDbContextAsync(CancellationToken cancellationToken = default) 
            => Task.FromResult(new LeaveManagementDbContext(options));
    }

    private class TestLeaveBalanceDataLoader(
        IBatchScheduler batchScheduler,
        DataLoaderOptions options,
        IDbContextFactory<LeaveManagementDbContext> dbContextFactory
    ) : LeaveBalanceDataLoader(batchScheduler, options, dbContextFactory)
    {
        public new Task<IReadOnlyDictionary<Guid, LeaveBalanceDto?>> LoadBatchAsync(
            IReadOnlyList<Guid> keys,
            CancellationToken cancellationToken
        ) => base.LoadBatchAsync(keys, cancellationToken);
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldCalculateBalanceFromPolicies_WhenNoManualEntitlement()
    {
        // Arrange
        var employee = new Employee 
        { 
            Id = Guid.NewGuid(), 
            FullName = "Test Employee", 
            HireDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-5)) // 5 years tenure
        };
        var absenceType = new AbsenceType 
        { 
            Id = Guid.NewGuid(), 
            Name = "Vacation", 
            DeductsFromBalance = true, 
            IsActive = true 
        };
        var policy = new EntitlementPolicy 
        { 
            Id = Guid.NewGuid(), 
            AbsenceTypeId = absenceType.Id, 
            MinTenureYears = 3, 
            EntitlementDays = 25, 
            IsActive = true 
        };
        
        _context.Employees.Add(employee);
        _context.AbsenceTypes.Add(absenceType);
        _context.EntitlementPolicies.Add(policy);
        await _context.SaveChangesAsync();

        var sut = new TestLeaveBalanceDataLoader(_batchScheduler, _dataLoaderOptions, _dbContextFactory);

        // Act
        var result = await sut.LoadBatchAsync(new[] { employee.Id }, CancellationToken.None);

        // Assert
        result.Should().ContainKey(employee.Id);
        var balance = result[employee.Id];
        balance.TotalEntitlement.Should().Be(25);
        balance.Taken.Should().Be(0);
        balance.Remaining.Should().Be(25);
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldUseManualEntitlement_WhenProvided()
    {
        // Arrange
        var employee = new Employee 
        { 
            Id = Guid.NewGuid(), 
            FullName = "Test Employee", 
            HireDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-1)) 
        };
        var absenceType = new AbsenceType { Id = Guid.NewGuid(), Name = "Vacation", DeductsFromBalance = true, IsActive = true };
        var manualEntitlement = new LeaveEntitlement 
        { 
            Id = Guid.NewGuid(), 
            EmployeeId = employee.Id, 
            AbsenceTypeId = absenceType.Id, 
            Year = DateTime.UtcNow.Year, 
            BaseDays = 30 
        };
        
        _context.Employees.Add(employee);
        _context.AbsenceTypes.Add(absenceType);
        _context.LeaveEntitlements.Add(manualEntitlement);
        await _context.SaveChangesAsync();

        var sut = new TestLeaveBalanceDataLoader(_batchScheduler, _dataLoaderOptions, _dbContextFactory);

        // Act
        var result = await sut.LoadBatchAsync(new[] { employee.Id }, CancellationToken.None);

        // Assert
        result.Should().ContainKey(employee.Id);
        result[employee.Id].TotalEntitlement.Should().Be(30);
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldSubtractApprovedRequests()
    {
        // Arrange
        var employee = new Employee { Id = Guid.NewGuid(), FullName = "Test Employee", HireDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-10)) };
        var absenceType = new AbsenceType { Id = Guid.NewGuid(), Name = "Vacation", DeductsFromBalance = true, IsActive = true };
        var manualEntitlement = new LeaveEntitlement { Id = Guid.NewGuid(), EmployeeId = employee.Id, AbsenceTypeId = absenceType.Id, Year = DateTime.UtcNow.Year, BaseDays = 20 };
        
        var approvedRequest = new AbsenceRequest 
        { 
            Id = Guid.NewGuid(), 
            EmployeeId = employee.Id, 
            AbsenceTypeId = absenceType.Id, 
            Status = RequestStatus.Approved,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
            TotalDaysRequested = 3
        };

        var pendingRequest = new AbsenceRequest 
        { 
            Id = Guid.NewGuid(), 
            EmployeeId = employee.Id, 
            AbsenceTypeId = absenceType.Id, 
            Status = RequestStatus.Pending,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
            TotalDaysRequested = 3
        };

        _context.Employees.Add(employee);
        _context.AbsenceTypes.Add(absenceType);
        _context.LeaveEntitlements.Add(manualEntitlement);
        _context.AbsenceRequests.AddRange(approvedRequest, pendingRequest);
        await _context.SaveChangesAsync();

        var sut = new TestLeaveBalanceDataLoader(_batchScheduler, _dataLoaderOptions, _dbContextFactory);

        // Act
        var result = await sut.LoadBatchAsync(new[] { employee.Id }, CancellationToken.None);

        // Assert
        result.Should().ContainKey(employee.Id);
        var balance = result[employee.Id];
        balance.TotalEntitlement.Should().Be(20);
        balance.Taken.Should().Be(3); // Only approved
        balance.Remaining.Should().Be(17);
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldDecrementTenure_WhenHireDateAnniversaryHasNotPassed()
    {
        // Arrange
        var today = DateTime.UtcNow;
        // Hire date is 5 years ago, but 1 month from now in that year
        var hireDate = DateOnly.FromDateTime(new DateTime(today.Year - 5, today.Month, today.Day).AddMonths(1));
        
        var employee = new Employee { Id = Guid.NewGuid(), FullName = "Tenure Test", HireDate = hireDate };
        var absenceType = new AbsenceType { Id = Guid.NewGuid(), Name = "Vacation", DeductsFromBalance = true, IsActive = true };
        
        // Policy for 4 years (tenure after decrement)
        var policy4 = new EntitlementPolicy { Id = Guid.NewGuid(), AbsenceTypeId = absenceType.Id, MinTenureYears = 4, EntitlementDays = 20, IsActive = true };
        // Policy for 5 years (tenure before decrement)
        var policy5 = new EntitlementPolicy { Id = Guid.NewGuid(), AbsenceTypeId = absenceType.Id, MinTenureYears = 5, EntitlementDays = 25, IsActive = true };

        _context.Employees.Add(employee);
        _context.AbsenceTypes.Add(absenceType);
        _context.EntitlementPolicies.AddRange(policy4, policy5);
        await _context.SaveChangesAsync();

        var sut = new TestLeaveBalanceDataLoader(_batchScheduler, _dataLoaderOptions, _dbContextFactory);

        // Act
        var result = await sut.LoadBatchAsync(new[] { employee.Id }, CancellationToken.None);

        // Assert
        result[employee.Id].TotalEntitlement.Should().Be(20); // Should pick policy4 (4 years tenure)
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldSkipNonExistentEmployee()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var sut = new TestLeaveBalanceDataLoader(_batchScheduler, _dataLoaderOptions, _dbContextFactory);

        // Act
        var result = await sut.LoadBatchAsync(new[] { nonExistentId }, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldHandleNullPolicy_ByAddingZeroEntitlement()
    {
        // Arrange
        var employee = new Employee { Id = Guid.NewGuid(), FullName = "No Policy Test", HireDate = DateOnly.FromDateTime(DateTime.UtcNow) };
        var absenceType = new AbsenceType { Id = Guid.NewGuid(), Name = "Vacation", DeductsFromBalance = true, IsActive = true };
        // No policies added to DB

        _context.Employees.Add(employee);
        _context.AbsenceTypes.Add(absenceType);
        await _context.SaveChangesAsync();

        var sut = new TestLeaveBalanceDataLoader(_batchScheduler, _dataLoaderOptions, _dbContextFactory);

        // Act
        var result = await sut.LoadBatchAsync(new[] { employee.Id }, CancellationToken.None);

        // Assert
        result[employee.Id].TotalEntitlement.Should().Be(0);
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldOnlyIncludeActiveTypesThatDeductFromBalance()
    {
        // Arrange
        var employee = new Employee { Id = Guid.NewGuid(), FullName = "Filter Test", HireDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-10)) };
        
        var deductType = new AbsenceType { Id = Guid.NewGuid(), Name = "Deduct", DeductsFromBalance = true, IsActive = true };
        var noDeductType = new AbsenceType { Id = Guid.NewGuid(), Name = "NoDeduct", DeductsFromBalance = false, IsActive = true };
        var inactiveType = new AbsenceType { Id = Guid.NewGuid(), Name = "Inactive", DeductsFromBalance = true, IsActive = false };
        
        var policy1 = new EntitlementPolicy { Id = Guid.NewGuid(), AbsenceTypeId = deductType.Id, MinTenureYears = 0, EntitlementDays = 10, IsActive = true };
        var policy2 = new EntitlementPolicy { Id = Guid.NewGuid(), AbsenceTypeId = noDeductType.Id, MinTenureYears = 0, EntitlementDays = 20, IsActive = true };
        var policy3 = new EntitlementPolicy { Id = Guid.NewGuid(), AbsenceTypeId = inactiveType.Id, MinTenureYears = 0, EntitlementDays = 30, IsActive = true };

        _context.Employees.Add(employee);
        _context.AbsenceTypes.AddRange(deductType, noDeductType, inactiveType);
        _context.EntitlementPolicies.AddRange(policy1, policy2, policy3);
        await _context.SaveChangesAsync();

        var sut = new TestLeaveBalanceDataLoader(_batchScheduler, _dataLoaderOptions, _dbContextFactory);

        // Act
        var result = await sut.LoadBatchAsync(new[] { employee.Id }, CancellationToken.None);

        // Assert
        result[employee.Id].TotalEntitlement.Should().Be(10); // Only deductType (10 days)
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
