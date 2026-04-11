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

/// <summary>Company management implementation.</summary>
public class CompanyService(LeaveManagementDbContext context) : ICompanyService
{
    private readonly LeaveManagementDbContext _context = context;

    /// <inheritdoc/>
    public async Task<Company?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Companies.FindAsync(new object[] { id }, ct);
    }

    /// <inheritdoc/>
    public async Task<IDictionary<Guid, Company>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken ct = default
    )
    {
        return await _context
            .Companies.Where(c => ids.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, ct);
    }

    /// <inheritdoc/>
    public async Task<PaginationResult<Company>> GetAllAsync(
        PaginationFilter filter,
        string? search = null,
        CancellationToken ct = default
    )
    {
        IQueryable<Company> query = _context.Companies;

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.Name.ToLower().Contains(search.ToLower()));
        }

        return await PagingHelper.ApplyPagingAsync(query, filter);
    }
}
