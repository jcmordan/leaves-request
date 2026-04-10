using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Application.Interfaces;

/// <summary>Department section management operations.</summary>
public interface IDepartmentSectionService
{
    /// <summary>Returns a single department section by ID.</summary>
    Task<DepartmentSection?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Returns department sections by their IDs for batch loading.</summary>
    Task<IDictionary<Guid, DepartmentSection>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken ct = default
    );

    /// <summary>Returns department sections with pagination and optional filters.</summary>
    Task<PaginationResult<DepartmentSection>> GetDepartmentSectionsAsync(
        PaginationFilter filter,
        Guid? departmentId = null,
        string? search = null,
        CancellationToken ct = default
    );
}
