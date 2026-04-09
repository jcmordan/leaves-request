using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LeaveManagement.Application.Interfaces;
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
    public async Task<IDictionary<Guid, Company>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default)
    {
        return await _context.Companies
            .Where(c => ids.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, ct);
    }
}
