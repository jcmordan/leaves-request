using System.Threading.Tasks;
using LeaveManagement.Application.Common.Paging;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Constants;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Application.Services;

public class LeaveRequestService : ILeaveRequestService
{
    private readonly LeaveManagementDbContext _context;
    private readonly IHolidayService _holidayService;
    private readonly IBalanceService _balanceService;

    public LeaveRequestService(
        LeaveManagementDbContext context,
        IHolidayService holidayService,
        IBalanceService balanceService
    )
    {
        _context = context;
        _holidayService = holidayService;
        _balanceService = balanceService;
    }

    public async Task<AbsenceRequest> SubmitRequestAsync(
        Guid employeeId,
        Guid absenceTypeId,
        DateTime startDate,
        DateTime endDate,
        string reason,
        string? diagnosis = null,
        string? treatingDoctor = null,
        byte[]? attachment = null,
        string? fileName = null
    )
    {
        if (startDate.Date < DateTime.UtcNow.Date)
        {
            throw new ArgumentException("Start date cannot be in the past.");
        }

        if (startDate > endDate)
        {
            throw new ArgumentException("Start date must be before or equal to end date.");
        }

        var absenceType =
            await _context.AbsenceTypes.FindAsync(absenceTypeId)
            ?? throw new Exception("Absence type not found.");

        if (
            absenceType.RequiresDoctor
            && (string.IsNullOrWhiteSpace(diagnosis) || string.IsNullOrWhiteSpace(treatingDoctor))
        )
        {
            throw new ArgumentException(
                "Diagnosis and Treating Doctor are mandatory for this leave type."
            );
        }

        if (absenceType.RequiresAttachment && (attachment == null || fileName == null))
        {
            throw new ArgumentException("An attachment is required for this leave type.");
        }

        if (fileName != null)
        {
            var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
            var extension = System.IO.Path.GetExtension(fileName).ToLower();
            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException(
                    "Invalid file format. Only PDF, JPG, and PNG are allowed."
                );
            }
        }

        int totalDays =
            absenceType.CalculationType == CalculationType.CalendarDays
                ? (endDate.Date - startDate.Date).Days + 1
                : await _holidayService.CalculateWorkingDaysAsync(startDate, endDate);

        if (totalDays <= 0)
        {
            throw new Exception("The selected dates do not result in any days.");
        }

        if (absenceType.MaxDaysPerYear > 0 && totalDays > absenceType.MaxDaysPerYear)
        {
            throw new Exception(
                $"The requested {totalDays} days exceed the maximum of {absenceType.MaxDaysPerYear} days allowed for {absenceType.Name}."
            );
        }

        var balance = await _balanceService.GetEmployeeBalanceAsync(employeeId, startDate.Year, absenceTypeId);

        if (absenceType.DeductsFromBalance && balance.Remaining < totalDays)
        {
            throw new Exception(
                $"Insufficient balance. Remaining: {balance.Remaining}, Requested: {totalDays}."
            );
        }

        var overlapping = await _context.AbsenceRequests.AnyAsync(r =>
            r.EmployeeId == employeeId
            && r.Status != RequestStatus.Cancelled
            && r.Status != RequestStatus.Rejected
            && r.StartDate <= endDate
            && r.EndDate >= startDate
        );

        if (overlapping)
        {
            throw new Exception("There is already a request for the selected dates.");
        }

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            AbsenceTypeId = absenceTypeId,
            StartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc),
            Status = RequestStatus.Pending,
            Reason = reason,
            Diagnosis = diagnosis,
            TreatingDoctor = treatingDoctor,
            TotalDaysRequested = totalDays,
            CreatedAt = DateTime.UtcNow,
            RequesterEmployeeId = employeeId,
        };

        if (attachment != null && fileName != null)
        {
            request.Attachments.Add(
                new Attachment
                {
                    Id = Guid.NewGuid(),
                    FileName = fileName,
                    FileType = "application/octet-stream",
                    Data = attachment,
                    UploadedAt = DateTime.UtcNow,
                }
            );
        }

        await _context.AbsenceRequests.AddAsync(request);
        await _context.SaveChangesAsync();

        return request;
    }

    public async Task<AbsenceRequest> ModifyRequestAsync(
        Guid requestId,
        DateTime startDate,
        DateTime endDate,
        string reason,
        string? diagnosis = null,
        string? treatingDoctor = null,
        byte[]? attachment = null,
        string? fileName = null
    )
    {
        var request =
            await _context
                .AbsenceRequests.Include(r => r.AbsenceType)
                .Include(r => r.Employee)
                .FirstOrDefaultAsync(r => r.Id == requestId)
            ?? throw new Exception("Request not found.");

        if (request.Status != RequestStatus.ModificationRequested)
        {
            throw new Exception(
                "Only requests where a modification was requested can be modified."
            );
        }

        var absenceType = request.AbsenceType!;
        var employeeId = request.EmployeeId;

        // Recalculate days
        int oldDays = request.TotalDaysRequested;
        int newDays =
            absenceType.CalculationType == CalculationType.CalendarDays
                ? (endDate.Date - startDate.Date).Days + 1
                : await _holidayService.CalculateWorkingDaysAsync(startDate, endDate);

        // Simple validation check
        if (absenceType.DeductsFromBalance)
        {
            var balance = await _balanceService.GetEmployeeBalanceAsync(employeeId, startDate.Year, request.AbsenceTypeId);

            if (balance.Remaining < newDays)
            {
                throw new Exception($"Insufficient balance. Remaining: {balance.Remaining}, Requested: {newDays} days.");
            }
        }

        request.StartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
        request.EndDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);
        request.Reason = reason;
        request.TotalDaysRequested = newDays;
        request.Diagnosis = diagnosis;
        request.TreatingDoctor = treatingDoctor;
        request.Status = RequestStatus.Pending; // Return to pending

        if (attachment != null && !string.IsNullOrEmpty(fileName))
        {
            request.Attachments.Add(
                new Attachment
                {
                    Id = Guid.NewGuid(),
                    FileName = fileName,
                    FileType = "application/octet-stream",
                    Data = attachment,
                    UploadedAt = DateTime.UtcNow,
                }
            );
        }

        await _context.SaveChangesAsync();
        return request;
    }

    public async Task<bool> ApproveRequestAsync(Guid requestId, Guid approverId, string comment)
    {
        var request =
            await _context
                .AbsenceRequests.Include(r => r.AbsenceType)
                .Include(r => r.Employee)
                .Include(r => r.ApprovalHistories)
                .FirstOrDefaultAsync(r => r.Id == requestId)
            ?? throw new Exception("Request not found.");

        var approver =
            await _context
                .Employees.Include(e => e.User)
                .FirstOrDefaultAsync(e => e.Id == approverId)
            ?? throw new Exception("Approver not found.");

        if (
            request.Status != RequestStatus.Pending
            && request.Status != RequestStatus.PendingCoordinatorApproval
        )
        {
            throw new Exception("Only pending requests can be approved.");
        }

        // Rule: Only the direct manager can approve (except for Medical leaves which need HR)
        bool isDirectManager = approverId == request.Employee?.ManagerId;
        bool isHR = approver.User?.Role == UserRole.HRManager;

        if (request.AbsenceType?.RequiresAttachment == true)
        {
            if (!isHR)
            {
                throw new Exception("Medical leaves must be validated and approved by an HR Administrator.");
            }
        }
        else if (!isDirectManager)
        {
            throw new Exception("Only the direct manager can approve this request.");
        }

        // For now, manager approval moves directly to Approved (bypassing Coordinator)
        request.Status = RequestStatus.Approved;

        var history = new ApprovalHistory
        {
            Id = Guid.NewGuid(),
            AbsenceRequestId = request.Id,
            ApproverEmployeeId = approverId,
            Action = ApprovalAction.Approved,
            Comment = comment,
            ActionDate = DateTime.UtcNow,
            StatusAfterAction = RequestStatus.Approved,
        };
        
        _context.ApprovalHistories.Add(history);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RequestModificationAsync(
        Guid requestId,
        Guid approverId,
        string comment
    )
    {
        var request =
            await _context.AbsenceRequests.FindAsync(requestId)
            ?? throw new Exception("Request not found.");

        request.Status = RequestStatus.ModificationRequested;
        var history = new ApprovalHistory
        {
            Id = Guid.NewGuid(),
            AbsenceRequestId = request.Id,
            ApproverEmployeeId = approverId,
            Action = ApprovalAction.Rejected,
            Comment = $"Modification requested: {comment}",
            ActionDate = DateTime.UtcNow,
            StatusAfterAction = RequestStatus.ModificationRequested,
        };
        _context.ApprovalHistories.Add(history);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RejectRequestAsync(Guid requestId, Guid approverId, string comment)
    {
        var request =
            await _context
                .AbsenceRequests
                .Include(r => r.AbsenceType)
                .Include(r => r.ApprovalHistories)
                .FirstOrDefaultAsync(r => r.Id == requestId)
            ?? throw new Exception("Request not found.");

        if (request.Status != RequestStatus.Pending)
        {
            throw new Exception("Only pending requests can be rejected.");
        }

        request.Status = RequestStatus.Rejected;
        
        var history = new ApprovalHistory
        {
            Id = Guid.NewGuid(),
            AbsenceRequestId = request.Id,
            ApproverEmployeeId = approverId,
            Action = ApprovalAction.Rejected,
            Comment = comment,
            ActionDate = DateTime.UtcNow,
            StatusAfterAction = RequestStatus.Rejected,
        };
        
        _context.ApprovalHistories.Add(history);

        // Balance is calculated dynamically, no manual update needed

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> CancelRequestAsync(Guid requestId, string reason)
    {
        var request =
            await _context
                .AbsenceRequests.Include(r => r.AbsenceType)
                .FirstOrDefaultAsync(r => r.Id == requestId)
            ?? throw new Exception("Request not found.");

        if (request.Status == RequestStatus.Rejected || request.Status == RequestStatus.Cancelled)
        {
            throw new Exception("Request is already in a final state and cannot be cancelled.");
        }

        request.Status = RequestStatus.Cancelled;

        // Balance is calculated dynamically, no manual update needed

        await _context.SaveChangesAsync();

        return true;
    }

    /// <inheritdoc/>
    public async Task<PaginationResult<AbsenceRequest>> GetAbsenceRequestsAsync(PaginationFilter filter, RequestStatus? status = null)
    {
        IQueryable<AbsenceRequest> query = _context.AbsenceRequests;
        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }
        return await PagingHelper.ApplyPagingAsync(query, filter);
    }

    /// <inheritdoc/>
    public async Task<PaginationResult<AbsenceType>> GetAbsenceTypesAsync(PaginationFilter filter)
    {
        IQueryable<AbsenceType> query = _context.AbsenceTypes;
        return await PagingHelper.ApplyPagingAsync(query, filter);
    }

    /// <inheritdoc/>
    public async Task<PaginationResult<AbsenceRequest>> GetTeamAbsencesAsync(Guid managerId, PaginationFilter filter, RequestStatus? status = null)
    {
        IQueryable<AbsenceRequest> query = _context.AbsenceRequests.Where(r => r.Employee!.ManagerId == managerId);
        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }
        return await PagingHelper.ApplyPagingAsync(query, filter);
    }

    /// <inheritdoc/>
    public async Task<PaginationResult<AbsenceRequest>> GetEmployeeRequestsAsync(Guid employeeId, PaginationFilter filter, RequestStatus? status = null)
    {
        IQueryable<AbsenceRequest> query = _context.AbsenceRequests.Where(r => r.EmployeeId == employeeId);
        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }
        return await PagingHelper.ApplyPagingAsync(query, filter);
    }

    /// <inheritdoc/>
    public async Task<AbsenceRequest?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.AbsenceRequests.FindAsync(new object[] { id }, ct);
    }
}
