using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Services;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Application.Tests.Helpers;
using LeaveManagement.Infrastructure.Data;
using LeaveManagement.Application.DTOs;
using FluentAssertions;
using NSubstitute;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Application.Tests.Services;

public class AbsenceTypeRulesTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly IHolidayService _holidayService;
    private readonly IBalanceService _balanceService;
    private readonly ICurrentUserService _currentUserService;
    private readonly LeaveRequestService _sut;
    private readonly Guid _employeeId = Guid.NewGuid();

    public AbsenceTypeRulesTests()
    {
        _context = TestDbContextFactory.Create();
        _holidayService = Substitute.For<IHolidayService>();
        _balanceService = Substitute.For<IBalanceService>();
        _currentUserService = Substitute.For<ICurrentUserService>();
        _sut = new LeaveRequestService(_context, _holidayService, _balanceService, _currentUserService);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    private async Task<AbsenceType> CreateAbsenceTypeAsync(string name, int maxDays, CalculationType calculationType, bool deductsFromBalance = false, bool requiresAttachment = false, bool requiresDoctor = false)
    {
        var absenceType = new AbsenceType
        {
            Id = Guid.NewGuid(),
            Name = name,
            MaxDaysPerYear = maxDays,
            CalculationType = calculationType,
            DeductsFromBalance = deductsFromBalance,
            RequiresAttachment = requiresAttachment,
            RequiresDoctor = requiresDoctor
        };
        _context.AbsenceTypes.Add(absenceType);
        await _context.SaveChangesAsync();
        return absenceType;
    }

    [Fact]
    public async Task SubmitRequest_Vacations_ShouldEnforceMaxDays()
    {
        // Arrange
        var type = await CreateAbsenceTypeAsync("Vacaciones", 26, CalculationType.WorkingDays, deductsFromBalance: true);
        var startDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc);
        
        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(30); // 30 working days
        _balanceService.GetEmployeeBalanceAsync(_employeeId, 2026, type.Id).Returns(new LeaveBalanceDto { Remaining = 40 });

        // Act
        var act = async () => await _sut.SubmitRequestAsync(_employeeId, type.Id, startDate, endDate, "Holiday");

        // Assert
        await act.Should().ThrowAsync<Exception>().WithMessage("*exceed the maximum of 26 days*");
    }

    [Fact]
    public async Task SubmitRequest_MedicalLeave_ShouldEnforceDoctorInfo()
    {
        // Arrange
        var type = await CreateAbsenceTypeAsync("Licencia Médica", 0, CalculationType.CalendarDays, requiresDoctor: true, requiresAttachment: true);
        var startDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = new DateTime(2026, 1, 5, 0, 0, 0, DateTimeKind.Utc);

        // Act
        var act = async () => await _sut.SubmitRequestAsync(_employeeId, type.Id, startDate, endDate, "Sick", diagnosis: "", treatingDoctor: "");

        // Assert
        await act.Should().ThrowAsync<ArgumentException>().WithMessage("*Diagnosis and Treating Doctor are mandatory*");
    }

    [Fact]
    public async Task SubmitRequest_Paternity_ShouldEnforceAttachment()
    {
        // Arrange
        var type = await CreateAbsenceTypeAsync("Paternidad", 2, CalculationType.WorkingDays, requiresAttachment: true);
        var startDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = new DateTime(2026, 1, 2, 0, 0, 0, DateTimeKind.Utc);
        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(2);

        // Act
        var act = async () => await _sut.SubmitRequestAsync(_employeeId, type.Id, startDate, endDate, "New baby");

        // Assert
        await act.Should().ThrowAsync<ArgumentException>().WithMessage("*attachment is required*");
    }

    [Fact]
    public async Task SubmitRequest_Vacations_ShouldHandleMixedHolidaysAndWeekends()
    {
        // Arrange
        var type = await CreateAbsenceTypeAsync("Vacaciones", 26, CalculationType.WorkingDays, deductsFromBalance: true);
        
        // Friday to Tuesday where Monday is Holiday
        var startDate = new DateTime(2026, 1, 2, 0, 0, 0, DateTimeKind.Utc); // Friday
        var endDate = new DateTime(2026, 1, 6, 0, 0, 0, DateTimeKind.Utc);   // Tuesday
        
        // Real working days calculation: Fri(1), Sat(X), Sun(X), Mon-Holiday(X), Tue(1) = 2 days
        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(2);
        _balanceService.GetEmployeeBalanceAsync(_employeeId, 2026, type.Id).Returns(new LeaveBalanceDto { Remaining = 10 });

        // Act
        var request = await _sut.SubmitRequestAsync(_employeeId, type.Id, startDate, endDate, "Holiday");

        // Assert
        request.TotalDaysRequested.Should().Be(2);
        request.Status.Should().Be(RequestStatus.Pending);
    }

    [Fact]
    public async Task SubmitRequest_Bereavement_ShouldHandleSubtypes()
    {
        // Arrange
        var parentType = await CreateAbsenceTypeAsync("Fallecimiento Familiar", 0, CalculationType.WorkingDays);
        var subType = new AbsenceType
        {
            Id = Guid.NewGuid(),
            ParentId = parentType.Id,
            Name = "Misma Provincia",
            MaxDaysPerYear = 3,
            CalculationType = CalculationType.WorkingDays
        };
        _context.AbsenceTypes.Add(subType);
        await _context.SaveChangesAsync();

        var startDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc);
        
        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(8);

        // Act
        var act = async () => await _sut.SubmitRequestAsync(_employeeId, subType.Id, startDate, endDate, "Bereavement");

        // Assert
        await act.Should().ThrowAsync<Exception>().WithMessage("*exceed the maximum of 3 days*");
    }
}
