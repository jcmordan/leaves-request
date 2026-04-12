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

public class ApprovalHistoriesByAbsenceRequestIdDataLoader(
    IBatchScheduler batchScheduler,
    DataLoaderOptions options,
    IDbContextFactory<LeaveManagementDbContext> dbContextFactory
) : GroupedDataLoader<Guid, ApprovalHistory>(batchScheduler, options)
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory = dbContextFactory;

    protected override async Task<ILookup<Guid, ApprovalHistory>> LoadGroupedBatchAsync(
        IReadOnlyList<Guid> keys,
        CancellationToken cancellationToken
    )
    {
        await using var context = await _dbContextFactory.CreateDbContextAsync(cancellationToken);
        var histories = await context
            .ApprovalHistories.Where(h => keys.Contains(h.AbsenceRequestId))
            .ToListAsync(cancellationToken);

        return histories.ToLookup(h => h.AbsenceRequestId);
    }
}
