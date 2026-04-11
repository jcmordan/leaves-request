using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Application.Interfaces;

/// <summary>Company management operations.</summary>
public interface ICompanyService
{
    /// <summary>Returns a single company by ID.</summary>
    Task<Company?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Returns companies by their IDs for batch loading.</summary>
    Task<IDictionary<Guid, Company>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken ct = default
    );

    /// <summary>Returns all companies with pagination and optional search.</summary>
    Task<PaginationResult<Company>> GetAllAsync(
        PaginationFilter filter,
        string? search = null,
        CancellationToken ct = default
    );
}
