using System;
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
public class DepartmentSectionQueries
{
    /// <summary>Returns all department sections, optionally filtered by department ID.</summary>
    [UsePaging(IncludeTotalCount = true)]
    public async Task<Connection<DepartmentSection>> GetDepartmentSections(
        int? first,
        string? after,
        int? last,
        string? before,
        Guid? departmentId,
        string? search,
        [Service] IDepartmentSectionService departmentSectionService
    )
    {
        var filter = new PaginationFilter(first, after, last, before);
        var paginatedResult = await departmentSectionService.GetDepartmentSectionsAsync(filter, departmentId, search);
        return paginatedResult.ToConnection();
    }
}
