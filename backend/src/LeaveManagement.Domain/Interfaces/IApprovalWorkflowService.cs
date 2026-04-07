using System;
using System.Threading.Tasks;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;

namespace LeaveManagement.Domain.Interfaces;

public interface IApprovalWorkflowService
{
    Task<RequestStatus> GetInitialStatusAsync(AbsenceRequest request);
    Task<RequestStatus> GetNextStatusAsync(AbsenceRequest request, ApprovalAction action, UserRole actorRole);
}
