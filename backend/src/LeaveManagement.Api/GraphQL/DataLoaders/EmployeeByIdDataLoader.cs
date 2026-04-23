using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Api.GraphQL.DataLoaders;

public class EmployeeByIdDataLoader(
    IBatchScheduler batchScheduler,
    DataLoaderOptions options,
    IDbContextFactory<LeaveManagementDbContext> dbContextFactory
) : BatchDataLoader<Guid, Employee?>(batchScheduler, options), IEmployeeByIdDataLoader
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory = dbContextFactory;

    protected override async Task<IReadOnlyDictionary<Guid, Employee?>> LoadBatchAsync(
        IReadOnlyList<Guid> keys,
        CancellationToken cancellationToken
    )
    {
        await using var context = await _dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await context
            .Employees.Where(e => keys.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id, e => (Employee?)e, cancellationToken);
    }
}
