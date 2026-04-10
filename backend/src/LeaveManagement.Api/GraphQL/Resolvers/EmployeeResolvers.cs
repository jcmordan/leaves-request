using LeaveManagement.Api.GraphQL.DataLoaders;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Api.GraphQL.Resolvers;

public class EmployeeResolvers
{
    public Task<Company?> GetCompanyAsync(
        [Parent] Employee employee,
        CompanyByIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        return dataLoader.LoadAsync(employee.CompanyId, cancellationToken);
    }

    public Task<Department?> GetDepartmentAsync(
        [Parent] Employee employee,
        DepartmentByIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        return dataLoader.LoadAsync(employee.DepartmentId, cancellationToken);
    }

    public Task<DepartmentSection?> GetDepartmentSectionAsync(
        [Parent] Employee employee,
        DepartmentSectionByIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        if (employee.DepartmentSectionId == null)
        {
            return Task.FromResult<DepartmentSection?>(null);
        }
        return dataLoader.LoadAsync(employee.DepartmentSectionId.Value, cancellationToken);
    }

    public async Task<IEnumerable<Employee>> GetSubordinatesAsync(
        [Parent] Employee employee,
        SubordinatesByEmployeeIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        var subordinates = await dataLoader.LoadAsync(employee.Id, cancellationToken);
        return subordinates ?? Enumerable.Empty<Employee>();
    }

    [GraphQLName("jobTitle")]
    public Task<JobTitle?> GetJobTitleAsync(
        [Parent] Employee employee,
        JobTitleByIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        if (employee.JobTitleId == null)
        {
            return Task.FromResult<JobTitle?>(null);
        }
        return dataLoader.LoadAsync(employee.JobTitleId.Value, cancellationToken);
    }

    public Task<Employee?> GetManagerAsync(
        [Parent] Employee employee,
        EmployeeByIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        if (employee.ManagerId == null)
        {
            return Task.FromResult<Employee?>(null);
        }
        return dataLoader.LoadAsync(employee.ManagerId.Value, cancellationToken);
    }

    public Task<LeaveBalanceDto> GetLeaveBalanceAsync(
        [Parent] Employee employee,
        LeaveBalanceDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        return dataLoader.LoadAsync(employee.Id, cancellationToken);
    }
}
