using System.Linq;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using HotChocolate.Types.Pagination;
using LeaveManagement.Api.GraphQL.Pagination;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Api.GraphQL.Queries;

[ExtendObjectType(typeof(Query))]
[Authorize]
public class LeaveRequestQueries
{
    [Authorize(Policy = "RequireManager")]
    [UsePaging(IncludeTotalCount = true)]
    public async Task<Connection<AbsenceRequest>> GetTeamAbsences(
        int? first,
        string? after,
        int? last,
        string? before,
        RequestStatus? status,
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService
    )
    {
        var managerId = await currentUserService.GetCurrentEmployeeIdAsync();
        var filter = new PaginationFilter(first, after, last, before);
        var result = await leaveRequestService.GetTeamAbsencesAsync(managerId, filter, status);
        return result.ToConnection();
    }

    [UsePaging(IncludeTotalCount = true)]
    public async Task<Connection<AbsenceRequest>> GetMyRequests(
        int? first,
        string? after,
        int? last,
        string? before,
        RequestStatus? status,
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService
    )
    {
        var employeeId = await currentUserService.GetCurrentEmployeeIdAsync();
        var filter = new PaginationFilter(first, after, last, before);
        var result = await leaveRequestService.GetEmployeeRequestsAsync(employeeId, filter, status);
        return result.ToConnection();
    }

    public async Task<LeaveBalanceDto> GetMyBalance(
        [Service] IBalanceService balanceService,
        [Service] ICurrentUserService currentUserService
    )
    {
        var employeeId = await currentUserService.GetCurrentEmployeeIdAsync();
        return await balanceService.GetEmployeeBalanceSummaryAsync(
            employeeId,
            DateTime.UtcNow.Year
        );
    }

    [UsePaging(IncludeTotalCount = true)]
    public async Task<Connection<AbsenceType>> GetAbsenceTypes(
        int? first,
        string? after,
        int? last,
        string? before,
        [Service] ILeaveRequestService leaveRequestService
    )
    {
        var filter = new PaginationFilter(first, after, last, before);
        var result = await leaveRequestService.GetAbsenceTypesAsync(filter);
        return result.ToConnection();
    }

    /// <summary>Returns a single leave request by ID.</summary>
    public async Task<AbsenceRequest?> GetRequest(
        [Service] ILeaveRequestService leaveRequestService,
        Guid id
    )
    {
        return await leaveRequestService.GetByIdAsync(id);
    }
}
