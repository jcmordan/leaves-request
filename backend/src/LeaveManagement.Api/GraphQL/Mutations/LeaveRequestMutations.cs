using LeaveManagement.Api.GraphQL.InputTypes;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Interfaces;

namespace LeaveManagement.Api.GraphQL.Mutations;

[ExtendObjectType(typeof(Mutation))]
public class LeaveRequestMutations(ILogger<LeaveRequestMutations> logger)
{
    private readonly ILogger<LeaveRequestMutations> _logger = logger;

    public async Task<LeaveRequestOperationPayload> SubmitLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService,
        [Service] IBalanceService balanceService,
        SubmitLeaveRequestInput input,
        CancellationToken ct
    )
    {
        _logger.LogInformation(
            "Submitting leave request for employee {EmployeeId}. Type: {AbsenceTypeId}",
            input.EmployeeId ?? await currentUserService.GetCurrentEmployeeIdAsync(),
            input.AbsenceTypeId
        );

        var employeeId = input.EmployeeId ?? await currentUserService.GetCurrentEmployeeIdAsync();

        System.IO.Stream? fileStream = null;
        string? fileName = null;

        if (input.File != null)
        {
            fileStream = input.File.OpenReadStream();
            fileName = input.File.Name;
        }

        var request = await leaveRequestService.SubmitRequestAsync(
            employeeId,
            input.AbsenceTypeId,
            input.StartDate,
            input.EndDate,
            input.Reason,
            input.AbsenceSubTypeId,
            input.Diagnosis,
            input.TreatingDoctor,
            fileStream,
            fileName
        );

        var balance = await balanceService.GetEmployeeBalanceSummaryAsync(
            employeeId,
            DateTime.UtcNow.Year
        );

        return new LeaveRequestOperationPayload(request, balance);
    }

    public async Task<LeaveRequestOperationPayload> ApproveLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService,
        [Service] IBalanceService balanceService,
        ApproveLeaveRequestInput input,
        CancellationToken ct
    )
    {
        var approverId = await currentUserService.GetCurrentEmployeeIdAsync();

        var request = await leaveRequestService.ApproveRequestAsync(
            input.RequestId,
            approverId,
            input.Comment
        );

        var balance = await balanceService.GetEmployeeBalanceSummaryAsync(
            request.EmployeeId,
            DateTime.UtcNow.Year
        );

        return new LeaveRequestOperationPayload(request, balance);
    }

    public async Task<LeaveRequestOperationPayload> RejectLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService,
        [Service] IBalanceService balanceService,
        RejectLeaveRequestInput input,
        CancellationToken ct
    )
    {
        var approverId = await currentUserService.GetCurrentEmployeeIdAsync();

        var request = await leaveRequestService.RejectRequestAsync(
            input.RequestId,
            approverId,
            input.Comment
        );

        var balance = await balanceService.GetEmployeeBalanceSummaryAsync(
            request.EmployeeId,
            DateTime.UtcNow.Year
        );

        return new LeaveRequestOperationPayload(request, balance);
    }

    public async Task<LeaveRequestOperationPayload> CancelLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] IBalanceService balanceService,
        CancelLeaveRequestInput input,
        CancellationToken ct
    )
    {
        var request = await leaveRequestService.CancelRequestAsync(input.RequestId, input.Reason);

        var balance = await balanceService.GetEmployeeBalanceSummaryAsync(
            request.EmployeeId,
            DateTime.UtcNow.Year
        );

        return new LeaveRequestOperationPayload(request, balance);
    }
}

public record LeaveRequestOperationPayload(AbsenceRequest Request, LeaveBalanceDto Balance);

