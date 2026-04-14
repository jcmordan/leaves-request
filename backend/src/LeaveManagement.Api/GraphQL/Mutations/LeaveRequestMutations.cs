using System;
using System.Threading;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Types;
using LeaveManagement.Api.GraphQL.InputTypes;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Interfaces;

namespace LeaveManagement.Api.GraphQL.Mutations;

[ExtendObjectType(typeof(Mutation))]
public class LeaveRequestMutations(ILogger<LeaveRequestMutations> logger)
{
    private readonly ILogger<LeaveRequestMutations> _logger = logger;

    public async Task<AbsenceRequest> SubmitLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService,
        SubmitLeaveRequestInput input,
        CancellationToken ct
    )
    {
        _logger.LogInformation(
            "Submitting leave request for employee {EmployeeId}. Type: {AbsenceTypeId}",
            await currentUserService.GetCurrentEmployeeIdAsync(),
            input.AbsenceTypeId
        );

        var employeeId = await currentUserService.GetCurrentEmployeeIdAsync();

        System.IO.Stream? fileStream = null;
        string? fileName = null;

        if (input.File != null)
        {
            fileStream = input.File.OpenReadStream();
            fileName = input.File.Name;
        }

        return await leaveRequestService.SubmitRequestAsync(
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
    }

    public async Task<AbsenceRequest> ApproveLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService,
        ApproveLeaveRequestInput input,
        CancellationToken ct
    )
    {
        var approverId = await currentUserService.GetCurrentEmployeeIdAsync();

        return await leaveRequestService.ApproveRequestAsync(
            input.RequestId,
            approverId,
            input.Comment
        );
    }

    public async Task<AbsenceRequest> RejectLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService,
        RejectLeaveRequestInput input,
        CancellationToken ct
    )
    {
        var approverId = await currentUserService.GetCurrentEmployeeIdAsync();

        return await leaveRequestService.RejectRequestAsync(
            input.RequestId,
            approverId,
            input.Comment
        );
    }

    public async Task<AbsenceRequest> CancelLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        CancelLeaveRequestInput input,
        CancellationToken ct
    )
    {
        return await leaveRequestService.CancelRequestAsync(input.RequestId, input.Reason);
    }
}
