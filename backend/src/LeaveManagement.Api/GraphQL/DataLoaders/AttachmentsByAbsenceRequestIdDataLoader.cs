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

public class AttachmentsByAbsenceRequestIdDataLoader(
    IBatchScheduler batchScheduler,
    DataLoaderOptions options,
    IDbContextFactory<LeaveManagementDbContext> dbContextFactory
) : GroupedDataLoader<Guid, Attachment>(batchScheduler, options), IAttachmentsByAbsenceRequestIdDataLoader
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory = dbContextFactory;

    protected override async Task<ILookup<Guid, Attachment>> LoadGroupedBatchAsync(
        IReadOnlyList<Guid> keys,
        CancellationToken cancellationToken
    )
    {
        await using var context = await _dbContextFactory.CreateDbContextAsync(cancellationToken);
        var attachments = await context
            .Attachments.Where(a => keys.Contains(a.AbsenceRequestId))
            .ToListAsync(cancellationToken);

        return attachments.ToLookup(a => a.AbsenceRequestId);
    }
}
