using LeaveManagement.Api.GraphQL.DataLoaders;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Api.GraphQL.Resolvers;

public class EmployeeResolvers
{
    public Task<Company?> GetCompanyAsync(
        [Parent] Employee employee,
        ICompanyByIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        return dataLoader.LoadAsync(employee.CompanyId, cancellationToken);
    }

    public Task<Department?> GetDepartmentAsync(
        [Parent] Employee employee,
        IDepartmentByIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        return dataLoader.LoadAsync(employee.DepartmentId, cancellationToken);
    }

    public Task<DepartmentSection?> GetDepartmentSectionAsync(
        [Parent] Employee employee,
        IDepartmentSectionByIdDataLoader dataLoader,
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
        ISubordinatesByEmployeeIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        var subordinates = await dataLoader.LoadAsync(employee.Id, cancellationToken);
        return subordinates ?? Enumerable.Empty<Employee>();
    }

    [GraphQLName("jobTitle")]
    public Task<JobTitle?> GetJobTitleAsync(
        [Parent] Employee employee,
        IJobTitleByIdDataLoader dataLoader,
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
        IEmployeeByIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        if (employee.ManagerId == null)
        {
            return Task.FromResult<Employee?>(null);
        }
        return dataLoader.LoadAsync(employee.ManagerId.Value, cancellationToken);
    }

    public Task<LeaveBalanceDto?> GetLeaveBalanceAsync(
        [Parent] Employee employee,
        ILeaveBalanceDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        return dataLoader.LoadAsync(employee.Id, cancellationToken);
    }
}
