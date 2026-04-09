using System.Linq;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using HotChocolate.Types.Pagination;
using LeaveManagement.Api.GraphQL.Pagination;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;

namespace LeaveManagement.Api.GraphQL.Queries;

[ExtendObjectType(typeof(Query))]
public class LeaveRequestQueries
{
    [Authorize(Policy = "RequireManager")]
    [UsePaging(IncludeTotalCount = true)]
    public async Task<Connection<AbsenceRequest>> GetTeamAbsences(
        int? first,
        string? after,
        int? last,
        string? before,
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService
    )
    {
        var managerId = currentUserService.GetCurrentEmployeeId();
        var filter = new PaginationFilter(first, after, last, before);
        var result = await leaveRequestService.GetTeamAbsencesAsync(managerId, filter);
        return result.ToConnection();
    }

    [UsePaging(IncludeTotalCount = true)]
    public async Task<Connection<AbsenceRequest>> GetMyRequests(
        int? first,
        string? after,
        int? last,
        string? before,
        [Service] ILeaveRequestService leaveRequestService,
        [Service] ICurrentUserService currentUserService
    )
    {
        var employeeId = currentUserService.GetCurrentEmployeeId();
        var filter = new PaginationFilter(first, after, last, before);
        var result = await leaveRequestService.GetEmployeeRequestsAsync(employeeId, filter);
        return result.ToConnection();
    }

    public async Task<VacationBalance> GetMyBalance(
        [Service] IBalanceService balanceService,
        [Service] ICurrentUserService currentUserService
    )
    {
        var employeeId = currentUserService.GetCurrentEmployeeId();

        return await balanceService.GetCurrentYearBalanceAsync(employeeId);
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
