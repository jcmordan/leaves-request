using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Pagination;
using LeaveManagement.Api.GraphQL.Pagination;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Api.GraphQL.Queries;

[ExtendObjectType(typeof(Query))]
public class CompanyQueries
{
    /// <summary>Returns all companies.</summary>
    [UsePaging(IncludeTotalCount = true)]
    public async Task<Connection<Company>> GetCompanies(
        int? first,
        string? after,
        int? last,
        string? before,
        [Service] ICompanyService companyService
    )
    {
        var result = await companyService.GetAllAsync();
        var items = result.ToList();
        var paginatedResult = new PaginationResult<Company>
        {
            Items = items,
            TotalCount = items.Count,
            HasNextPage = false,
            HasPreviousPage = false
        };
        return paginatedResult.ToConnection();
    }
}
