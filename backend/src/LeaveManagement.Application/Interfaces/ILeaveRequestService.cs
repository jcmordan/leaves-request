using System.Threading.Tasks;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;

namespace LeaveManagement.Application.Interfaces;

public interface ILeaveRequestService
{
    Task<AbsenceRequest> SubmitRequestAsync(
        Guid employeeId,
        Guid absenceTypeId,
        DateTime startDate,
        DateTime endDate,
        string reason,
        string? diagnosis = null,
        string? treatingDoctor = null,
        byte[]? attachment = null,
        string? fileName = null
    );
    Task<AbsenceRequest> ModifyRequestAsync(
        Guid requestId,
        DateTime startDate,
        DateTime endDate,
        string reason,
        string? diagnosis = null,
        string? treatingDoctor = null,
        byte[]? attachment = null,
        string? fileName = null
    );

    Task<bool> ApproveRequestAsync(Guid requestId, Guid approverId, string comment);
    Task<bool> RequestModificationAsync(Guid requestId, Guid approverId, string comment);
    Task<bool> RejectRequestAsync(Guid requestId, Guid approverId, string comment);
    Task<bool> CancelRequestAsync(Guid requestId, string reason);

    /// <summary>Returns a paged collection of all absence requests.</summary>
    Task<PaginationResult<AbsenceRequest>> GetAbsenceRequestsAsync(PaginationFilter filter, RequestStatus? status = null);

    /// <summary>Returns a paged collection of all absence types.</summary>
    Task<PaginationResult<AbsenceType>> GetAbsenceTypesAsync(PaginationFilter filter);

    /// <summary>Returns paged absence requests for a manager's team.</summary>
    Task<PaginationResult<AbsenceRequest>> GetTeamAbsencesAsync(Guid managerId, PaginationFilter filter, RequestStatus? status = null);

    /// <summary>Returns paged absence requests for a specific employee.</summary>
    Task<PaginationResult<AbsenceRequest>> GetEmployeeRequestsAsync(Guid employeeId, PaginationFilter filter, RequestStatus? status = null);

    /// <summary>Returns a single absence request by ID.</summary>
    Task<AbsenceRequest?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
