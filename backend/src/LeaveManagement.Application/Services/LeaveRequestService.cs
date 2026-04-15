using LeaveManagement.Application.Common.Paging;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Application.Services;

public class LeaveRequestService(
    LeaveManagementDbContext context,
    IHolidayService holidayService,
    IBalanceService balanceService,
    ICurrentUserService currentUserService
    ) : ILeaveRequestService
{
    private readonly LeaveManagementDbContext _context = context;
    private readonly IHolidayService _holidayService = holidayService;
    private readonly IBalanceService _balanceService = balanceService;
    private readonly ICurrentUserService _currentUserService = currentUserService;


    public async Task<AbsenceRequest> SubmitRequestAsync(
        Guid employeeId,
        Guid absenceTypeId,
        DateTime startDate,
        DateTime endDate,
        string reason,
        Guid? absenceSubTypeId = null,
        string? diagnosis = null,
        string? treatingDoctor = null,
        System.IO.Stream? fileStream = null,
        string? fileName = null
    )
    {


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

        if (absenceType.RequiresAttachment && (fileStream == null || fileName == null))
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

        var reqeustedBy = await _currentUserService.GetCurrentEmployeeIdAsync();

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            AbsenceTypeId = absenceTypeId,
            AbsenceSubTypeId = absenceSubTypeId,
            StartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc),
            Status = RequestStatus.Pending,
            Reason = reason,
            Diagnosis = diagnosis,
            TreatingDoctor = treatingDoctor,
            TotalDaysRequested = totalDays,
            CreatedAt = DateTime.UtcNow,
            RequesterEmployeeId = reqeustedBy,
        };

        if (fileStream != null && fileName != null)
        {
            var filePath = await SaveFileAsync(fileStream, fileName);
            request.Attachments.Add(
                new Attachment
                {
                    Id = Guid.NewGuid(),
                    FileName = fileName,
                    FileType = "application/octet-stream",
                    FilePath = filePath,
                    FileSize = fileStream.Length,
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
        Guid? absenceSubTypeId = null,
        string? diagnosis = null,
        string? treatingDoctor = null,
        System.IO.Stream? fileStream = null,
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

        if (absenceSubTypeId.HasValue)
        {
            var subType = await _context.AbsenceTypes.FindAsync(absenceSubTypeId.Value);
            if (subType == null || subType.ParentId != request.AbsenceTypeId)
            {
                throw new Exception("Invalid absence subtype.");
            }
            request.AbsenceSubTypeId = absenceSubTypeId.Value;
        }

        if (fileStream != null && !string.IsNullOrEmpty(fileName))
        {
            var filePath = await SaveFileAsync(fileStream, fileName);
            request.Attachments.Add(
                new Attachment
                {
                    Id = Guid.NewGuid(),
                    FileName = fileName,
                    FileType = "application/octet-stream",
                    FilePath = filePath,
                    FileSize = fileStream.Length,
                    UploadedAt = DateTime.UtcNow,
                }
            );
        }

        await _context.SaveChangesAsync();
        return request;
    }

    public async Task<AbsenceRequest> ApproveRequestAsync(Guid requestId, Guid approverId, string comment)
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
        bool isHR = approver.User?.Roles.Contains(UserRole.HRManager) ?? false;

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

        return request;
    }

    public async Task<AbsenceRequest> RequestModificationAsync(
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

        return request;
    }

    public async Task<AbsenceRequest> RejectRequestAsync(Guid requestId, Guid approverId, string comment)
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

        return request;
    }

    public async Task<AbsenceRequest> CancelRequestAsync(Guid requestId, string reason)
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

        return request;
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
        IQueryable<AbsenceRequest> query = _context.AbsenceRequests.Where(r => r.EmployeeId == employeeId || r.RequesterEmployeeId == employeeId);
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

    private async Task<IEnumerable<OverlappingAbsenceDto>> GetOverlappingAbsencesAsync(Guid requestId, Guid managerId, CancellationToken ct = default)
    {
        var request = await _context.AbsenceRequests
            .FirstOrDefaultAsync(r => r.Id == requestId, ct)
            ?? throw new Exception("Request not found.");

        var startDate = request.StartDate;
        var endDate = request.EndDate;

        var overlaps = await _context.AbsenceRequests
            .Include(r => r.Employee)
            .ThenInclude(e => e!.JobTitle)
            .Where(r => r.Id != requestId) // Exclude current request
            .Where(r => r.Employee!.ManagerId == managerId) // Same team
            .Where(r => r.Status == RequestStatus.Approved || r.Status == RequestStatus.Pending)
            .Where(r => r.StartDate <= endDate && r.EndDate >= startDate) // Overlap check
            .Select(r => new OverlappingAbsenceDto
            {
                EmployeeName = r.Employee!.FullName,
                JobTitle = r.Employee.JobTitle != null ? r.Employee.JobTitle.Name : string.Empty,
                StartDate = r.StartDate,
                EndDate = r.EndDate
            })
            .ToListAsync(ct);

        return overlaps;
    }

    private async Task<(int Percentage, int Total, int ApprovedCount, int PendingCount)> GetTeamCapacityMetricsAsync(Guid requestId, Guid managerId, CancellationToken ct = default)
    {
        var request = await _context.AbsenceRequests
            .FirstOrDefaultAsync(r => r.Id == requestId, ct)
            ?? throw new Exception("Request not found.");

        var startDate = request.StartDate;
        var endDate = request.EndDate;

        // Total active team members under the same manager
        var teamMembersCount = await _context.Employees
            .CountAsync(e => e.ManagerId == managerId && e.IsActive, ct);

        if (teamMembersCount == 0) return (100, 0, 0, 0);

        // Employees with Approved requests in this period
        var approvedAbsentCount = await _context.AbsenceRequests
            .Where(r => r.Employee!.ManagerId == managerId)
            .Where(r => r.Status == RequestStatus.Approved)
            .Where(r => r.StartDate <= endDate && r.EndDate >= startDate)
            .Select(r => r.EmployeeId)
            .Distinct()
            .CountAsync(ct);

        // Employees with Pending requests in this period (excluding those already counted in Approved)
        var pendingAbsentCount = await _context.AbsenceRequests
            .Where(r => r.Employee!.ManagerId == managerId)
            .Where(r => r.Status == RequestStatus.Pending)
            .Where(r => r.StartDate <= endDate && r.EndDate >= startDate)
            .Select(r => r.EmployeeId)
            .Distinct()
            .CountAsync(ct);

        // Calculate availability percentage based on Approved only (as current reality)
        var availableCount = Math.Max(0, teamMembersCount - approvedAbsentCount);
        var percentage = (int)Math.Round((double)availableCount / teamMembersCount * 100);

        return (percentage, teamMembersCount, approvedAbsentCount, pendingAbsentCount);
    }

    /// <inheritdoc/>
    public async Task<AbsenceAnalysisDto> GetAbsenceAnalysisAsync(Guid requestId, Guid managerId, CancellationToken ct = default)
    {
        var overlaps = await GetOverlappingAbsencesAsync(requestId, managerId, ct);
        var capacity = await GetTeamCapacityMetricsAsync(requestId, managerId, ct);

        return new AbsenceAnalysisDto
        {
            OverlappingAbsences = overlaps,
            AvailablePercentage = capacity.Percentage,
            TotalTeamMembers = capacity.Total,
            MembersOnLeave = capacity.ApprovedCount,
            PendingMembersOnLeave = capacity.PendingCount
        };
    }

    private async Task<string> SaveFileAsync(System.IO.Stream fileStream, string fileName)
    {
        var basePathConfig = await _context.Configurations.FirstOrDefaultAsync(c => c.Key == "AttachmentBasePath");
        string basePath = basePathConfig?.Value ?? "uploads";

        if (!System.IO.Directory.Exists(basePath))
        {
            System.IO.Directory.CreateDirectory(basePath);
        }

        string uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        string filePath = System.IO.Path.Combine(basePath, uniqueFileName);

        using (var fs = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
        {
            await fileStream.CopyToAsync(fs);
        }

        return filePath;
    }
}
