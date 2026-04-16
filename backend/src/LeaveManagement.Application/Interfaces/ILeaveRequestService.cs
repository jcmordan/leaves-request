using System.Threading.Tasks;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;

namespace LeaveManagement.Application.Interfaces;

public interface ILeaveRequestService
{
    Task<AbsenceRequest> SubmitRequestAsync(
        Guid employeeId,
        Guid absenceTypeId,
        DateOnly startDate,
        DateOnly endDate,
        string reason,
        Guid? absenceSubTypeId = null,
        string? diagnosis = null,
        string? treatingDoctor = null,
        System.IO.Stream? fileStream = null,
        string? fileName = null
    );
    Task<AbsenceRequest> ModifyRequestAsync(
        Guid requestId,
        DateOnly startDate,
        DateOnly endDate,
        string reason,
        Guid? absenceSubTypeId = null,
        string? diagnosis = null,
        string? treatingDoctor = null,
        System.IO.Stream? fileStream = null,
        string? fileName = null
    );

    Task<AbsenceRequest> ApproveRequestAsync(Guid requestId, Guid approverId, string comment);
    Task<AbsenceRequest> RequestModificationAsync(Guid requestId, Guid approverId, string comment);
    Task<AbsenceRequest> RejectRequestAsync(Guid requestId, Guid approverId, string comment);
    Task<AbsenceRequest> CancelRequestAsync(Guid requestId, string reason);

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

    /// <summary>Calculates comprehensive absence analysis (overlaps and capacity) for a specific request using a manager's team context.</summary>
    Task<LeaveRequestSummary> GetAbsenceAnalysisAsync(Guid requestId, Guid managerId, CancellationToken ct = default);

    /// <summary>Returns a comprehensive dashboard summary for the manager's team.</summary>
    Task<LeaveRequestSummary> GetApprovalsDashboardSummaryAsync(Guid managerId, DateOnly? today = null, int forecastDays = 14, CancellationToken ct = default);
}
