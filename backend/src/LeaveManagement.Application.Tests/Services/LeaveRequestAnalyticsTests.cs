using FluentAssertions;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Services;
using LeaveManagement.Application.Tests.Helpers;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace LeaveManagement.Application.Tests.Services;

public class LeaveRequestAnalyticsTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly IHolidayService _holidayService;
    private readonly IBalanceService _balanceService;
    private readonly ICurrentUserService _currentUserService;
    private readonly LeaveRequestService _sut;
    private readonly Guid _managerId = Guid.NewGuid();
    private readonly Guid _absenceTypeId = Guid.NewGuid();

    public LeaveRequestAnalyticsTests()
    {
        _context = TestDbContextFactory.Create();
        _holidayService = Substitute.For<IHolidayService>();
        _balanceService = Substitute.For<IBalanceService>();
        _currentUserService = Substitute.For<ICurrentUserService>();
        _sut = new LeaveRequestService(_context, _holidayService, _balanceService, _currentUserService);

        SeedData();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private void SeedData()
    {
        var jobTitle = new JobTitle { Id = Guid.NewGuid(), Name = "Developer" };
        _context.JobTitles.Add(jobTitle);

        _context.AbsenceTypes.Add(new AbsenceType
        {
            Id = _absenceTypeId,
            Name = "Vacation",
            IsActive = true
        });

        // Team Members
        var employees = new[]
        {
            new Employee { Id = Guid.NewGuid(), FullName = "Member 1", ManagerId = _managerId, IsActive = true, JobTitleId = jobTitle.Id },
            new Employee { Id = Guid.NewGuid(), FullName = "Member 2", ManagerId = _managerId, IsActive = true, JobTitleId = jobTitle.Id },
            new Employee { Id = Guid.NewGuid(), FullName = "Member 3", ManagerId = _managerId, IsActive = true, JobTitleId = jobTitle.Id },
            new Employee { Id = Guid.NewGuid(), FullName = "Member 4", ManagerId = Guid.NewGuid(), IsActive = true, JobTitleId = jobTitle.Id } // Other team
        };

        _context.Employees.AddRange(employees);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetOverlappingAbsencesAsync_ShouldReturnCorrectOverlaps()
    {
        // Arrange
        var teamMember1 = await _context.Employees.FirstAsync(e => e.FullName == "Member 1");
        var teamMember2 = await _context.Employees.FirstAsync(e => e.FullName == "Member 2");
        var otherTeamMember = await _context.Employees.FirstAsync(e => e.FullName == "Member 4");

        var startDate = new DateTime(2024, 10, 20);
        var endDate = new DateTime(2024, 10, 25);

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = teamMember1.Id,
            StartDate = startDate,
            EndDate = endDate,
            Status = RequestStatus.Pending
        };

        var overlappingRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = teamMember2.Id,
            StartDate = startDate.AddDays(1),
            EndDate = endDate.AddDays(1),
            Status = RequestStatus.Approved
        };

        var nonOverlappingRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = teamMember2.Id,
            StartDate = startDate.AddDays(10),
            EndDate = endDate.AddDays(10),
            Status = RequestStatus.Approved
        };

        var otherTeamRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = otherTeamMember.Id,
            StartDate = startDate,
            EndDate = endDate,
            Status = RequestStatus.Approved
        };

        _context.AbsenceRequests.AddRange(request, overlappingRequest, nonOverlappingRequest, otherTeamRequest);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetAbsenceAnalysisAsync(request.Id, _managerId);

        // Assert
        result.OverlappingAbsences.Should().HaveCount(1);
        result.OverlappingAbsences.First().EmployeeName.Should().Be("Member 2");
    }

    [Fact]
    public async Task GetTeamCapacityAsync_ShouldReturnCorrectPercentage()
    {
        // Arrange
        var employees = await _context.Employees.Where(e => e.ManagerId == _managerId).ToListAsync();
        var teamMember1 = employees[0];
        var teamMember2 = employees[1];

        var startDate = new DateTime(2024, 10, 20);
        var endDate = new DateTime(2024, 10, 25);

        // Current request impact should be included (2 members absent out of 3 total)
        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = teamMember1.Id,
            StartDate = startDate,
            EndDate = endDate,
            Status = RequestStatus.Pending
        };

        var otherAbsent = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = teamMember2.Id,
            StartDate = startDate,
            EndDate = endDate,
            Status = RequestStatus.Approved
        };

        _context.AbsenceRequests.AddRange(request, otherAbsent);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetAbsenceAnalysisAsync(request.Id, _managerId);

        // Assert
        // Team size = 3
        // Approved Absent = 1 (Member 2)
        // Pending Absent = 1 (Member 1)
        // Available (Current) = 2/3 = 67%
        result.AvailablePercentage.Should().Be(67);
        result.TotalTeamMembers.Should().Be(3);
        result.MembersOnLeave.Should().Be(1);
        result.PendingMembersOnLeave.Should().Be(1);
    }
}
