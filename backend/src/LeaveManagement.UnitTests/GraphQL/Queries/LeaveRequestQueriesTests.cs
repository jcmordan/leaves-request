using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using HotChocolate.Types.Pagination;
using LeaveManagement.Api.GraphQL.Queries;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Domain.Interfaces;
using NSubstitute;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.Queries;

public class LeaveRequestQueriesTests
{
    private readonly ILeaveRequestService _leaveRequestService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IBalanceService _balanceService;
    private readonly LeaveRequestQueries _sut;

    public LeaveRequestQueriesTests()
    {
        _leaveRequestService = Substitute.For<ILeaveRequestService>();
        _currentUserService = Substitute.For<ICurrentUserService>();
        _balanceService = Substitute.For<IBalanceService>();
        _sut = new LeaveRequestQueries();
    }

    [Fact]
    public async Task GetTeamAbsences_ShouldCallServiceWithCorrectParameters()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var status = RequestStatus.Pending;
        var pagedResult = new PaginationResult<AbsenceRequest> { Items = new List<AbsenceRequest>(), TotalCount = 0 };
        
        _currentUserService.GetCurrentEmployeeIdAsync().Returns(managerId);
        _leaveRequestService.GetTeamAbsencesAsync(managerId, Arg.Any<PaginationFilter>(), status)
            .Returns(pagedResult);

        // Act
        var result = await _sut.GetTeamAbsences(10, null, null, null, status, _leaveRequestService, _currentUserService);

        // Assert
        result.Should().NotBeNull();
        await _leaveRequestService.Received(1).GetTeamAbsencesAsync(managerId, Arg.Any<PaginationFilter>(), status);
    }

    [Fact]
    public async Task GetMyRequests_ShouldCallServiceWithCorrectParameters()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var status = RequestStatus.Approved;
        var pagedResult = new PaginationResult<AbsenceRequest> { Items = new List<AbsenceRequest>(), TotalCount = 0 };

        _currentUserService.GetCurrentEmployeeIdAsync().Returns(employeeId);
        _leaveRequestService.GetEmployeeRequestsAsync(employeeId, Arg.Any<PaginationFilter>(), status)
            .Returns(pagedResult);

        // Act
        var result = await _sut.GetMyRequests(10, null, null, null, status, _leaveRequestService, _currentUserService);

        // Assert
        result.Should().NotBeNull();
        await _leaveRequestService.Received(1).GetEmployeeRequestsAsync(employeeId, Arg.Any<PaginationFilter>(), status);
    }

    [Fact]
    public async Task GetMyBalance_ShouldCallService()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var expectedBalance = new LeaveBalanceDto { TotalEntitlement = 20, Taken = 5, Remaining = 15 };

        _currentUserService.GetCurrentEmployeeIdAsync().Returns(employeeId);
        _balanceService.GetEmployeeBalanceSummaryAsync(employeeId, Arg.Any<int>()).Returns(expectedBalance);

        // Act
        var result = await _sut.GetMyBalance(_balanceService, _currentUserService);

        // Assert
        result.Should().Be(expectedBalance);
        await _balanceService.Received(1).GetEmployeeBalanceSummaryAsync(employeeId, Arg.Any<int>());
    }

    [Fact]
    public async Task GetAbsenceTypes_ShouldCallService()
    {
        // Arrange
        var pagedResult = new PaginationResult<AbsenceType> { Items = new List<AbsenceType>(), TotalCount = 0 };
        _leaveRequestService.GetAbsenceTypesAsync(Arg.Any<PaginationFilter>()).Returns(pagedResult);

        // Act
        var result = await _sut.GetAbsenceTypes(10, null, null, null, _leaveRequestService);

        // Assert
        result.Should().NotBeNull();
        await _leaveRequestService.Received(1).GetAbsenceTypesAsync(Arg.Any<PaginationFilter>());
    }

    [Fact]
    public async Task GetRequest_ShouldCallService()
    {
        // Arrange
        var id = Guid.NewGuid();
        var expectedRequest = new AbsenceRequest { Id = id };
        _leaveRequestService.GetByIdAsync(id).Returns(expectedRequest);

        // Act
        var result = await _sut.GetRequest(_leaveRequestService, id);

        // Assert
        result.Should().Be(expectedRequest);
        await _leaveRequestService.Received(1).GetByIdAsync(id);
    }

    [Fact]
    public async Task GetApprovalsDashboardSummary_ShouldCallServiceWithCorrectParameters()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var managerId = Guid.NewGuid();
        var expectedSummary = new LeaveRequestSummary { TotalTeamMembers = 5 };

        _currentUserService.GetCurrentEmployeeIdAsync().Returns(managerId);
        _leaveRequestService.GetApprovalsDashboardSummaryAsync(managerId, today, Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(expectedSummary);

        // Act
        var result = await _sut.GetApprovalsDashboardSummary(today, _leaveRequestService, _currentUserService, 14, CancellationToken.None);

        // Assert
        result.Should().Be(expectedSummary);
        await _leaveRequestService.Received(1).GetApprovalsDashboardSummaryAsync(managerId, today, Arg.Any<int>(), Arg.Any<CancellationToken>());
    }
}
