using System.Linq;
using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;

using LeaveManagement.Application.Interfaces;
using LeaveManagement.Api.GraphQL.Pagination;
using HotChocolate.Types.Pagination;
using LeaveManagement.Application.Models.Paging;
using System.Threading.Tasks;

namespace LeaveManagement.Api.GraphQL.Queries;

[ExtendObjectType(typeof(Query))]
public class DepartmentQueries
{
    [UsePaging(IncludeTotalCount = true)]
    public async Task<Connection<Department>> GetDepartments(
        int? first,
        string? after,
        int? last,
        string? before,
        string? search,
        [Service] IDepartmentService departmentService
    )
    {
        var filter = new PaginationFilter(first, after, last, before);
        var result = await departmentService.GetDepartmentsAsync(filter, search);
        return result.ToConnection();
    }
}
