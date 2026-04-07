using System;
using System.Linq;
using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;

namespace LeaveManagement.Api.GraphQL.Queries;

[ExtendObjectType(typeof(Query))]
public class EmployeeQueries
{
    /// <summary>Returns all employees. Supports projection, filtering and sorting.</summary>
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Employee> GetEmployees([Service] LeaveManagementDbContext context)
    {
        return context.Employees;
    }

    /// <summary>Returns a single employee by ID.</summary>
    [UseProjection]
    [UseFirstOrDefault]
    [GraphQLName("employee")]
    public IQueryable<Employee> GetEmployeeById([Service] LeaveManagementDbContext context, Guid id)
    {
        return context.Employees.Where(e => e.Id == id);
    }
}
