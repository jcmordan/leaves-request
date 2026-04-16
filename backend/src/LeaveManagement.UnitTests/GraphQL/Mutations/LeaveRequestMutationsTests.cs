using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using HotChocolate.Types;
using LeaveManagement.Api.GraphQL.InputTypes;
using LeaveManagement.Api.GraphQL.Mutations;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.Mutations;

public class LeaveRequestMutationsTests
{
    private readonly ILeaveRequestService _leaveRequestService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IBalanceService _balanceService;
    private readonly ILogger<LeaveRequestMutations> _logger;
    private readonly LeaveRequestMutations _sut;

    public LeaveRequestMutationsTests()
    {
        _leaveRequestService = Substitute.For<ILeaveRequestService>();
        _currentUserService = Substitute.For<ICurrentUserService>();
        _balanceService = Substitute.For<IBalanceService>();
        _logger = Substitute.For<ILogger<LeaveRequestMutations>>();
        _sut = new LeaveRequestMutations(_logger);
    }

    [Fact]
    public async Task SubmitLeaveRequest_ShouldReturnPayloadWithRequestAndBalance()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var absenceTypeId = Guid.NewGuid();
        var absenceSubTypeId = Guid.NewGuid();
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));
        var input = new SubmitLeaveRequestInput(
            EmployeeId: null,
            AbsenceTypeId: absenceTypeId,
            StartDate: startDate,
            EndDate: endDate,
            Reason: "Vacation",
            AbsenceSubTypeId: absenceSubTypeId,
            Diagnosis: "Cold",
            TreatingDoctor: "Dr. Smith",
            File: null
        );

        var expectedRequest = new AbsenceRequest { Id = Guid.NewGuid(), EmployeeId = employeeId };
        var expectedBalance = new LeaveBalanceDto { Remaining = 10 };

        _currentUserService.GetCurrentEmployeeIdAsync().Returns(employeeId);
        _leaveRequestService.SubmitRequestAsync(
            employeeId,
            input.AbsenceTypeId,
            input.StartDate,
            input.EndDate,
            input.Reason,
            input.AbsenceSubTypeId,
            input.Diagnosis,
            input.TreatingDoctor,
            null,
            null
        ).Returns(expectedRequest);

        _balanceService.GetEmployeeBalanceSummaryAsync(employeeId, Arg.Any<int>())
            .Returns(expectedBalance);

        // Act
        var result = await _sut.SubmitLeaveRequest(_leaveRequestService, _currentUserService, _balanceService, input, CancellationToken.None);

        // Assert
        result.Request.Should().Be(expectedRequest);
        result.Balance.Should().Be(expectedBalance);
        await _leaveRequestService.Received(1).SubmitRequestAsync(
            employeeId,
            input.AbsenceTypeId,
            input.StartDate,
            input.EndDate,
            input.Reason,
            input.AbsenceSubTypeId,
            input.Diagnosis,
            input.TreatingDoctor,
            null,
            null
        );
        await _balanceService.Received(1).GetEmployeeBalanceSummaryAsync(employeeId, Arg.Any<int>());
    }

    [Fact]
    public async Task ApproveLeaveRequest_ShouldReturnPayloadWithRequestAndBalance()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var approverId = Guid.NewGuid();
        var input = new ApproveLeaveRequestInput(Guid.NewGuid(), "Approved");
        var expectedRequest = new AbsenceRequest { Id = input.RequestId, EmployeeId = employeeId };
        var expectedBalance = new LeaveBalanceDto { Remaining = 8 };

        _currentUserService.GetCurrentEmployeeIdAsync().Returns(approverId);
        _leaveRequestService.ApproveRequestAsync(input.RequestId, approverId, input.Comment).Returns(expectedRequest);
        _balanceService.GetEmployeeBalanceSummaryAsync(employeeId, Arg.Any<int>())
            .Returns(expectedBalance);

        // Act
        var result = await _sut.ApproveLeaveRequest(_leaveRequestService, _currentUserService, _balanceService, input, CancellationToken.None);

        // Assert
        result.Request.Should().Be(expectedRequest);
        result.Balance.Should().Be(expectedBalance);
        await _leaveRequestService.Received(1).ApproveRequestAsync(input.RequestId, approverId, input.Comment);
        await _balanceService.Received(1).GetEmployeeBalanceSummaryAsync(employeeId, Arg.Any<int>());
    }

    [Fact]
    public async Task RejectLeaveRequest_ShouldReturnPayloadWithRequestAndBalance()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var approverId = Guid.NewGuid();
        var input = new RejectLeaveRequestInput(Guid.NewGuid(), "Rejected");
        var expectedRequest = new AbsenceRequest { Id = input.RequestId, EmployeeId = employeeId };
        var expectedBalance = new LeaveBalanceDto { Remaining = 10 };

        _currentUserService.GetCurrentEmployeeIdAsync().Returns(approverId);
        _leaveRequestService.RejectRequestAsync(input.RequestId, approverId, input.Comment).Returns(expectedRequest);
        _balanceService.GetEmployeeBalanceSummaryAsync(employeeId, Arg.Any<int>())
            .Returns(expectedBalance);

        // Act
        var result = await _sut.RejectLeaveRequest(_leaveRequestService, _currentUserService, _balanceService, input, CancellationToken.None);

        // Assert
        result.Request.Should().Be(expectedRequest);
        result.Balance.Should().Be(expectedBalance);
        await _leaveRequestService.Received(1).RejectRequestAsync(input.RequestId, approverId, input.Comment);
        await _balanceService.Received(1).GetEmployeeBalanceSummaryAsync(employeeId, Arg.Any<int>());
    }

    [Fact]
    public async Task CancelLeaveRequest_ShouldReturnPayloadWithRequestAndBalance()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var input = new CancelLeaveRequestInput(Guid.NewGuid(), "Change of plans");
        var expectedRequest = new AbsenceRequest { Id = input.RequestId, EmployeeId = employeeId };
        var expectedBalance = new LeaveBalanceDto { Remaining = 10 };

        _leaveRequestService.CancelRequestAsync(input.RequestId, input.Reason).Returns(expectedRequest);
        _balanceService.GetEmployeeBalanceSummaryAsync(employeeId, Arg.Any<int>())
            .Returns(expectedBalance);

        // Act
        var result = await _sut.CancelLeaveRequest(_leaveRequestService, _balanceService, input, CancellationToken.None);

        // Assert
        result.Request.Should().Be(expectedRequest);
        result.Balance.Should().Be(expectedBalance);
        await _leaveRequestService.Received(1).CancelRequestAsync(input.RequestId, input.Reason);
        await _balanceService.Received(1).GetEmployeeBalanceSummaryAsync(employeeId, Arg.Any<int>());
    }
}

