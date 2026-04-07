using System.Linq;
using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;

namespace LeaveManagement.Api.GraphQL.Queries;

[ExtendObjectType(typeof(Query))]
public class DepartmentQueries
{
    /// <summary>Returns all active departments.</summary>
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Department> GetDepartments([Service] LeaveManagementDbContext context)
    {
        return context.Departments.Where(d => d.IsActive);
    }
}
