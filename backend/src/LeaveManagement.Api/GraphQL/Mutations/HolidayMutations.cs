using HotChocolate;
using HotChocolate.Authorization;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Constants;

namespace LeaveManagement.Api.GraphQL.Mutations;

[ExtendObjectType(typeof(Mutation))]
public class HolidayMutations
{
    [Authorize(Roles = new[] { Roles.Manager, Roles.HRManager, Roles.Admin })]
    public async Task<int> SyncPublicHolidaysAsync(
        [Service] IHolidayService holidayService,
        int year,
        string countryCode)
    {
        return await holidayService.SyncPublicHolidaysAsync(year, countryCode);
    }
}
