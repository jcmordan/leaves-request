using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LeaveManagement.Application.Common.Paging;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Application.Services;

/// <summary>Job title management implementation.</summary>
public class JobTitleService(LeaveManagementDbContext context) : IJobTitleService
{
    private readonly LeaveManagementDbContext _context = context;

    /// <inheritdoc/>
    public async Task<JobTitle?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.JobTitles.FindAsync(new object[] { id }, ct);
    }

    /// <inheritdoc/>
    public async Task<IDictionary<Guid, JobTitle>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken ct = default
    )
    {
        return await _context
            .JobTitles.Where(jt => ids.Contains(jt.Id))
            .ToDictionaryAsync(jt => jt.Id, ct);
    }

    /// <inheritdoc/>
    public async Task<PaginationResult<JobTitle>> GetAllAsync(
        PaginationFilter filter,
        CancellationToken ct = default
    )
    {
        return await PagingHelper.ApplyPagingAsync(_context.JobTitles, filter);
    }
}
