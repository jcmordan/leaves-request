using System.Linq;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;

using Microsoft.AspNetCore.Authorization;

namespace LeaveManagement.Api.GraphQL.Queries;

[ExtendObjectType(typeof(Query))]
public class LeaveRequestQueries
{
    [Authorize(Policy = "RequireManager")]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<AbsenceRequest> GetTeamAbsences(
        [Service] LeaveManagementDbContext context,
        [Service] ICurrentUserService currentUserService
    )
    {
        var managerId = currentUserService.GetCurrentEmployeeId();

        return context.AbsenceRequests
            .Where(r => r.Employee!.ManagerId == managerId);
    }

    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<AbsenceRequest> GetMyRequests(
        [Service] LeaveManagementDbContext context,
        [Service] ICurrentUserService currentUserService
    )
    {
        var employeeId = currentUserService.GetCurrentEmployeeId();

        return context.AbsenceRequests.Where(r => r.EmployeeId == employeeId);
    }

    public async Task<VacationBalance> GetMyBalance(
        [Service] IBalanceService balanceService,
        [Service] ICurrentUserService currentUserService
    )
    {
        var employeeId = currentUserService.GetCurrentEmployeeId();

        return await balanceService.GetCurrentYearBalanceAsync(employeeId);
    }

    [UseProjection]
    public IQueryable<AbsenceType> GetAbsenceTypes([Service] LeaveManagementDbContext context)
    {
        return context.AbsenceTypes.Where(t => t.IsActive);
    }

    /// <summary>Returns a single leave request by ID.</summary>
    [UseProjection]
    [UseFirstOrDefault]
    public IQueryable<AbsenceRequest> GetRequest(
        [Service] LeaveManagementDbContext context,
        Guid id
    )
    {
        return context.AbsenceRequests.Where(r => r.Id == id);
    }
}
