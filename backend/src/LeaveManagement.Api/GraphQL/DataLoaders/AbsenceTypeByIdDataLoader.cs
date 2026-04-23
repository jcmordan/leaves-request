using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using GreenDonut;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Api.GraphQL.DataLoaders;

public class AbsenceTypeByIdDataLoader(
    IBatchScheduler batchScheduler,
    DataLoaderOptions options,
    IDbContextFactory<LeaveManagementDbContext> dbContextFactory
) : BatchDataLoader<Guid, AbsenceType?>(batchScheduler, options), IAbsenceTypeByIdDataLoader
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory = dbContextFactory;

    protected override async Task<IReadOnlyDictionary<Guid, AbsenceType?>> LoadBatchAsync(
        IReadOnlyList<Guid> keys,
        CancellationToken cancellationToken
    )
    {
        await using var context = await _dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await context
            .AbsenceTypes.Where(t => keys.Contains(t.Id))
            .ToDictionaryAsync(t => t.Id, t => (AbsenceType?)t, cancellationToken);
    }
}
