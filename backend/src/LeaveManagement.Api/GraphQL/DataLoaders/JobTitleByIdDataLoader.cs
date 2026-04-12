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

public class JobTitleByIdDataLoader(
    IBatchScheduler batchScheduler,
    DataLoaderOptions options,
    IDbContextFactory<LeaveManagementDbContext> dbContextFactory
) : BatchDataLoader<Guid, JobTitle>(batchScheduler, options), IJobTitleByIdDataLoader
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory = dbContextFactory;

    protected override async Task<IReadOnlyDictionary<Guid, JobTitle>> LoadBatchAsync(
        IReadOnlyList<Guid> keys,
        CancellationToken cancellationToken
    )
    {
        await using var context = await _dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await context
            .JobTitles.Where(jt => keys.Contains(jt.Id))
            .ToDictionaryAsync(jt => jt.Id, cancellationToken);
    }
}
