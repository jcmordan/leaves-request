using System;
using System.Threading;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Types;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Api.GraphQL.Mutations;

[ExtendObjectType(typeof(Mutation))]
public class LeaveRequestMutations
{
    public async Task<AbsenceRequest> SubmitLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService,
        Guid absenceTypeId,
        DateTime startDate,
        DateTime endDate,
        string reason,
        CancellationToken ct
    )
    {
        var employeeId = currentUserService.GetCurrentEmployeeId();

        return await leaveRequestService.SubmitRequestAsync(
            employeeId,
            absenceTypeId,
            startDate,
            endDate,
            reason);
    }

    public async Task<bool> ApproveLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService,
        Guid requestId,
        string comment,
        CancellationToken ct
    )
    {
        var approverId = currentUserService.GetCurrentEmployeeId();

        return await leaveRequestService.ApproveRequestAsync(requestId, approverId, comment);
    }

    public async Task<bool> RejectLeaveRequest(
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService,
        Guid requestId,
        string comment,
        CancellationToken ct
    )
    {
        var approverId = currentUserService.GetCurrentEmployeeId();

        return await leaveRequestService.RejectRequestAsync(requestId, approverId, comment);
    }
}
