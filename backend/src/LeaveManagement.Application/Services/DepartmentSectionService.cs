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

/// <summary>Department section management implementation.</summary>
public class DepartmentSectionService(LeaveManagementDbContext context) : IDepartmentSectionService
{
    private readonly LeaveManagementDbContext _context = context;

    /// <inheritdoc/>
    public async Task<DepartmentSection?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.DepartmentSections.FindAsync(new object[] { id }, ct);
    }

    /// <inheritdoc/>
    public async Task<IDictionary<Guid, DepartmentSection>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default)
    {
        return await _context.DepartmentSections
            .Where(ds => ids.Contains(ds.Id))
            .ToDictionaryAsync(ds => ds.Id, ct);
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<DepartmentSection>> GetByDepartmentIdAsync(Guid? departmentId = null, CancellationToken ct = default)
    {
        var query = _context.DepartmentSections.AsQueryable();

        if (departmentId.HasValue)
        {
            query = query.Where(ds => ds.DepartmentId == departmentId.Value);
        }

        return await query.OrderBy(ds => ds.Name).ToListAsync(ct);
    }
}
