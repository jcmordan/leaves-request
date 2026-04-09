using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HotChocolate;
using LeaveManagement.Api.GraphQL.DataLoaders;
using LeaveManagement.Domain.Entities;

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
}
