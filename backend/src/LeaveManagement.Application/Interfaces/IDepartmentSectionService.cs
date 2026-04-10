using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Application.Interfaces;

/// <summary>Department section management operations.</summary>
public interface IDepartmentSectionService
{
    /// <summary>Returns a single department section by ID.</summary>
    Task<DepartmentSection?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Returns department sections by their IDs for batch loading.</summary>
    Task<IDictionary<Guid, DepartmentSection>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default);

    /// <summary>Returns all department sections, optionally filtered by department ID.</summary>
    Task<IEnumerable<DepartmentSection>> GetByDepartmentIdAsync(Guid? departmentId = null, CancellationToken ct = default);
}
