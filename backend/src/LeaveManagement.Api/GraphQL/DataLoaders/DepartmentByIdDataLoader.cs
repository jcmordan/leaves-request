using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Api.GraphQL.DataLoaders;

public class DepartmentByIdDataLoader(
    IBatchScheduler batchScheduler,
    DataLoaderOptions options,
    IDbContextFactory<LeaveManagementDbContext> dbContextFactory
) : BatchDataLoader<Guid, Department?>(batchScheduler, options), IDepartmentByIdDataLoader
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory = dbContextFactory;

    protected override async Task<IReadOnlyDictionary<Guid, Department?>> LoadBatchAsync(
        IReadOnlyList<Guid> keys,
        CancellationToken cancellationToken
    )
    {
        await using var context = await _dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await context
            .Departments.Where(d => keys.Contains(d.Id))
            .ToDictionaryAsync(d => d.Id, d => (Department?)d, cancellationToken);
    }
}
