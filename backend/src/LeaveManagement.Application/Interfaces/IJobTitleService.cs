using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Application.Interfaces;

/// <summary>Job title management operations.</summary>
public interface IJobTitleService
{
    /// <summary>Returns a single job title by ID.</summary>
    Task<JobTitle?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Returns job titles by their IDs for batch loading.</summary>
    Task<IDictionary<Guid, JobTitle>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken ct = default
    );

    /// <summary>Returns all job titles with pagination.</summary>
    Task<PaginationResult<JobTitle>> GetAllAsync(
        PaginationFilter filter,
        CancellationToken ct = default
    );
}
