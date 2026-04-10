using LeaveManagement.Application.Common.Paging;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Models.Paging;
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
    public async Task<IDictionary<Guid, DepartmentSection>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken ct = default
    )
    {
        return await _context
            .DepartmentSections.Where(ds => ids.Contains(ds.Id))
            .ToDictionaryAsync(ds => ds.Id, ct);
    }

    /// <inheritdoc/>
    public async Task<PaginationResult<DepartmentSection>> GetDepartmentSectionsAsync(
        PaginationFilter filter,
        Guid? departmentId = null,
        string? search = null,
        CancellationToken ct = default
    )
    {
        var query = _context.DepartmentSections.AsQueryable();

        if (departmentId.HasValue)
        {
            query = query.Where(ds => ds.DepartmentId == departmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(ds => ds.Name.ToLower().Contains(search.ToLower()));
        }

        return await PagingHelper.ApplyPagingAsync(query, filter);
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<DepartmentSection>> GetByDepartmentIdAsync(
        Guid? departmentId = null,
        CancellationToken ct = default
    )
    {
        var query = _context.DepartmentSections.AsQueryable();

        if (departmentId.HasValue)
        {
            query = query.Where(ds => ds.DepartmentId == departmentId.Value);
        }

        return await query.OrderBy(ds => ds.Name).ToListAsync(ct);
    }
}
