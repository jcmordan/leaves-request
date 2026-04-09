using System;
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
using LeaveManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;

namespace LeaveManagement.Api.GraphQL.Queries;

[ExtendObjectType(typeof(Query))]
public class EmployeeQueries
{
    [Authorize(Policy = "RequireHR")]
    /// <summary>Returns all employees. Supports projection, filtering and sorting.</summary>
    [UsePaging(IncludeTotalCount = true)]
    public async Task<Connection<Employee>> GetEmployees(
        int? first,
        string? after,
        int? last,
        string? before,
        string? search,
        [Service] IEmployeeService employeeService
    )
    {
        var filter = new PaginationFilter(first, after, last, before);
        var result = await employeeService.GetEmployeesAsync(filter, search);

        return result.ToConnection();
    }

    /// <summary>Returns a single employee by ID.</summary>
    [GraphQLName("employee")]
    public async Task<Employee?> GetEmployeeById(
        [Service] IEmployeeService employeeService,
        Guid id
    )
    {
        return await employeeService.GetByIdAsync(id);
    }

    /// <summary>
    /// Returns statistics about employees.
    /// </summary>
    [GraphQLName("employeeStats")]
    public async Task<EmployeeStats> GetEmployeeStats([Service] IEmployeeService employeeService)
    {
        return await employeeService.GetEmployeeStatsAsync();
    }
}
