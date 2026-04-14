using System.Collections.Generic;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Types;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Api.GraphQL.Types;

namespace LeaveManagement.Api.GraphQL.Queries;

[ExtendObjectType(typeof(Query))]
public class HolidayQueries
{
    /// <summary>Returns a collection of public holidays for a specific year.</summary>
    public async Task<List<PublicHoliday>> GetPublicHolidays(
        int year,
        [Service] IHolidayService holidayService
    )
    {
        return await holidayService.GetPublicHolidaysAsync(year);
    }
}
