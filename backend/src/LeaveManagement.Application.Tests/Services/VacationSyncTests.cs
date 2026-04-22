using FluentAssertions;
using LeaveManagement.Application.Services;
using LeaveManagement.Application.Tests.Helpers;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Interfaces;
using System;
using System.Threading.Tasks;
using Xunit;

namespace LeaveManagement.Application.Tests.Services;

public class VacationSyncTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly IHolidayService _holidayService;
    private readonly IBalanceService _balanceService;
    private readonly ICurrentUserService _currentUserService;
    private readonly LeaveRequestService _sut;
    private readonly Guid _employeeId = Guid.NewGuid();
    private readonly Guid _managerId = Guid.NewGuid();

    public VacationSyncTests()
    {
        _context = TestDbContextFactory.Create();
        _holidayService = Substitute.For<IHolidayService>();
        _balanceService = Substitute.For<IBalanceService>();
        _currentUserService = Substitute.For<ICurrentUserService>();
        _sut = new LeaveRequestService(_context, _holidayService, _balanceService, _currentUserService);

        SeedData().Wait();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private async Task SeedData()
    {
        var manager = new Employee
        {
            Id = _managerId,
            FullName = "Manager",
            EmployeeCode = "MGR001",
            NationalId = "M1",
            IsActive = true
        };

        var employee = new Employee
        {
            Id = _employeeId,
            FullName = "Employee",
            EmployeeCode = "EMP001",
            NationalId = "E1",
            ManagerId = _managerId,
            IsActive = true
        };

        _context.Employees.AddRange(manager, employee);
        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task ApproveRequestAsync_StandardVacation_ShouldCreateSyncAsEnjoy()
    {
        // Arrange
        var vacationTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(new AbsenceType
        {
            Id = vacationTypeId,
            Name = "Vacation",
            IsSellingType = true,
            IsActive = true
        });

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = vacationTypeId,
            StartDate = new DateOnly(2024, 5, 1),
            EndDate = new DateOnly(2024, 5, 10),
            Status = RequestStatus.Pending,
            TotalDaysRequested = 8,
            RequesterEmployeeId = _employeeId
        };
        _context.AbsenceRequests.Add(request);
        await _context.SaveChangesAsync();

        // Act
        await _sut.ApproveRequestAsync(request.Id, _managerId, "Enjoy your holiday!");

        // Assert
        var sync = await _context.VacationSyncs.FirstOrDefaultAsync(s => s.EmployeeId == _employeeId);
        sync.Should().NotBeNull();
        sync!.Type.Should().Be(0); // Enjoy
        sync.TotalDays.Should().Be(8);
        sync.EmployeeCode.Should().Be("EMP001");
    }

    [Fact]
    public async Task ApproveRequestAsync_VacationSelling_ShouldCreateSyncAsSell()
    {
        // Arrange
        var parentId = Guid.NewGuid();
        var sellTypeId = Guid.NewGuid();
        
        _context.AbsenceTypes.AddRange(
            new AbsenceType { Id = parentId, Name = "Vacation", IsSellingType = true, IsActive = true },
            new AbsenceType { Id = sellTypeId, Name = "Vacation Sell", IsSellingType = true, ParentId = parentId, IsActive = true }
        );

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = sellTypeId,
            StartDate = new DateOnly(2024, 5, 1),
            EndDate = new DateOnly(2024, 5, 1),
            Status = RequestStatus.Pending,
            TotalDaysRequested = 5,
            RequesterEmployeeId = _employeeId
        };
        _context.AbsenceRequests.Add(request);
        await _context.SaveChangesAsync();

        // Act
        await _sut.ApproveRequestAsync(request.Id, _managerId, "Money is good.");

        // Assert
        var sync = await _context.VacationSyncs.FirstOrDefaultAsync(s => s.EmployeeId == _employeeId);
        sync.Should().NotBeNull();
        sync!.Type.Should().Be(1); // Sell
        sync.TotalDays.Should().Be(5);
    }

    [Fact]
    public async Task ApproveRequestAsync_OtherRequest_ShouldNotCreateSync()
    {
        // Arrange
        var otherTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(new AbsenceType { Id = otherTypeId, Name = "Sickness", IsSellingType = false, IsActive = true });

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = otherTypeId,
            StartDate = new DateOnly(2024, 5, 1),
            EndDate = new DateOnly(2024, 5, 1),
            Status = RequestStatus.Pending,
            TotalDaysRequested = 1,
            RequesterEmployeeId = _employeeId
        };
        _context.AbsenceRequests.Add(request);
        await _context.SaveChangesAsync();

        // Act
        await _sut.ApproveRequestAsync(request.Id, _managerId, "Get well soon.");

        // Assert
        var sync = await _context.VacationSyncs.AnyAsync();
        sync.Should().BeFalse();
    }

    [Fact]
    public async Task SubmitRequestAsync_SellingSubType_ShouldAllowOverlap()
    {
        // Arrange
        var mainTypeId = Guid.NewGuid();
        var sellSubTypeId = Guid.NewGuid();
        var enjoySubTypeId = Guid.NewGuid();

        _context.AbsenceTypes.AddRange(
            new AbsenceType { Id = mainTypeId, Name = "Vacation", IsSellingType = true, IsActive = true, CalculationType = CalculationType.CalendarDays },
            new AbsenceType { Id = sellSubTypeId, Name = "Venta", IsSellingType = true, ParentId = mainTypeId, IsActive = true, CalculationType = CalculationType.CalendarDays },
            new AbsenceType { Id = enjoySubTypeId, Name = "Disfrute", IsSellingType = false, ParentId = mainTypeId, IsActive = true, CalculationType = CalculationType.CalendarDays }
        );

        // 1. Create an "Enjoyment" request
        var enjoyRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = mainTypeId,
            AbsenceSubTypeId = enjoySubTypeId,
            StartDate = new DateOnly(2024, 6, 1),
            EndDate = new DateOnly(2024, 6, 10),
            Status = RequestStatus.Approved,
            TotalDaysRequested = 8
        };
        _context.AbsenceRequests.Add(enjoyRequest);
        await _context.SaveChangesAsync();

        // 2. Submit a "Selling" request for the SAME period
        // Act & Assert
        Func<Task> act = async () => await _sut.SubmitRequestAsync(
            _employeeId,
            mainTypeId,
            new DateOnly(2024, 6, 1),
            new DateOnly(2024, 6, 5),
            "I want money during my vacation",
            sellSubTypeId
        );

        await act.Should().NotThrowAsync("Selling requests should skip overlap validation.");
    }

    [Fact]
    public async Task SubmitRequestAsync_EnjoymentSubType_ShouldNotAllowOverlap()
    {
        // Arrange
        var mainTypeId = Guid.NewGuid();
        var enjoySubTypeId = Guid.NewGuid();

        _context.AbsenceTypes.AddRange(
            new AbsenceType { Id = mainTypeId, Name = "Vacation", IsSellingType = true, IsActive = true, CalculationType = CalculationType.CalendarDays },
            new AbsenceType { Id = enjoySubTypeId, Name = "Disfrute", IsSellingType = false, ParentId = mainTypeId, IsActive = true, CalculationType = CalculationType.CalendarDays }
        );

        // 1. Existing request
        var existingRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = mainTypeId,
            AbsenceSubTypeId = enjoySubTypeId,
            StartDate = new DateOnly(2024, 7, 1),
            EndDate = new DateOnly(2024, 7, 10),
            Status = RequestStatus.Approved,
            TotalDaysRequested = 8
        };
        _context.AbsenceRequests.Add(existingRequest);
        await _context.SaveChangesAsync();

        // 2. Submit another "Enjoyment" request for overlapping dates
        // Act & Assert
        Func<Task> act = async () => await _sut.SubmitRequestAsync(
            _employeeId,
            mainTypeId,
            new DateOnly(2024, 7, 5),
            new DateOnly(2024, 7, 12),
            "This should fail",
            enjoySubTypeId
        );

        await act.Should().ThrowAsync<Exception>().WithMessage("There is already a request for the selected dates.");
    }
}
