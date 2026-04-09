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
public class LeaveRequestMutations
{
    public async Task<AbsenceRequest> SubmitLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService,
        SubmitLeaveRequestInput input,
        CancellationToken ct
    )
    {
        var employeeId = currentUserService.GetCurrentEmployeeId();

        return await leaveRequestService.SubmitRequestAsync(
            employeeId,
            input.AbsenceTypeId,
            input.StartDate,
            input.EndDate,
            input.Reason,
            input.Diagnosis,
            input.TreatingDoctor
        );
    }

    public async Task<bool> ApproveLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService,
        ApproveLeaveRequestInput input,
        CancellationToken ct
    )
    {
        var approverId = currentUserService.GetCurrentEmployeeId();

        return await leaveRequestService.ApproveRequestAsync(input.RequestId, approverId, input.Comment);
    }

    public async Task<bool> RejectLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService,
        RejectLeaveRequestInput input,
        CancellationToken ct
    )
    {
        var approverId = currentUserService.GetCurrentEmployeeId();

        return await leaveRequestService.RejectRequestAsync(input.RequestId, approverId, input.Comment);
    }
}
