using System;
using System.Threading.Tasks;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Application.Interfaces;

public interface ILeaveRequestService
{
    Task<AbsenceRequest> SubmitRequestAsync(Guid employeeId, Guid absenceTypeId, DateTime startDate, DateTime endDate, string reason, string? diagnosis = null, string? treatingDoctor = null, byte[]? attachment = null, string? fileName = null);
    Task<AbsenceRequest> ModifyRequestAsync(Guid requestId, DateTime startDate, DateTime endDate, string reason, string? diagnosis = null, string? treatingDoctor = null, byte[]? attachment = null, string? fileName = null);
    Task<bool> ApproveRequestAsync(Guid requestId, Guid approverId, string comment);
    Task<bool> RequestModificationAsync(Guid requestId, Guid approverId, string comment);
    Task<bool> RejectRequestAsync(Guid requestId, Guid approverId, string comment);
    Task<bool> CancelRequestAsync(Guid requestId, string reason);
}
