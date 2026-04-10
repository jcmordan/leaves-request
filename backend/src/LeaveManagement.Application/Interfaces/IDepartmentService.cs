using System.Threading.Tasks;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Application.Interfaces;

/// <summary>Department management operations.</summary>
public interface IDepartmentService
{
    /// <summary>Returns a paged collection of active departments with optional search.</summary>
    Task<PaginationResult<Department>> GetDepartmentsAsync(PaginationFilter filter, string? search = null);

    /// <summary>Returns a single department by ID.</summary>
    Task<Department?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Returns departments by their IDs for batch loading.</summary>
    Task<IDictionary<Guid, Department>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default);
}
