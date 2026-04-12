using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using GreenDonut;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Api.GraphQL.DataLoaders;

public class SubordinatesByEmployeeIdDataLoader(
    IBatchScheduler batchScheduler,
    DataLoaderOptions options,
    IDbContextFactory<LeaveManagementDbContext> dbContextFactory
) : GroupedDataLoader<Guid, Employee>(batchScheduler, options), ISubordinatesByEmployeeIdDataLoader
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory = dbContextFactory;

    protected override async Task<ILookup<Guid, Employee>> LoadGroupedBatchAsync(
        IReadOnlyList<Guid> keys,
        CancellationToken cancellationToken
    )
    {
        await using var context = await _dbContextFactory.CreateDbContextAsync(cancellationToken);
        var subcontractors = await context
            .Employees.Where(x => x.ManagerId != null && keys.Contains(x.ManagerId.Value))
            .ToListAsync(cancellationToken);

        return subcontractors.ToLookup(x => x.ManagerId!.Value, x => x);
    }
}
