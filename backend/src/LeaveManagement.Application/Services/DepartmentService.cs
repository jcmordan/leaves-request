using System.Linq;
using System.Threading.Tasks;
using LeaveManagement.Application.Common.Paging;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Application.Services;

/// <summary>Department management implementation.</summary>
public class DepartmentService : IDepartmentService
{
    private readonly LeaveManagementDbContext _context;

    public DepartmentService(LeaveManagementDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc/>
    public async Task<PaginationResult<Department>> GetDepartmentsAsync(PaginationFilter filter, string? search = null)
    {
        IQueryable<Department> query = _context.Departments;

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(d => d.Name.ToLower().Contains(search.ToLower()));
        }

        return await PagingHelper.ApplyPagingAsync(query, filter);
    }

    /// <inheritdoc/>
    public async Task<Department?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Departments.FindAsync([id], ct);
    }

    /// <inheritdoc/>
    public async Task<IDictionary<Guid, Department>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken ct = default
    )
    {
        return await _context
            .Departments.Where(d => ids.Contains(d.Id))
            .ToDictionaryAsync(d => d.Id, ct);
    }
}
