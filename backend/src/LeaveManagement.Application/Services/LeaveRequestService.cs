using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LeaveManagement.Application.Interfaces;
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

    public LeaveRequestService(LeaveManagementDbContext context, IHolidayService holidayService)
    {
        _context = context;
        _holidayService = holidayService;
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

        var balance =
            await _context.VacationBalances.FirstOrDefaultAsync(b =>
                b.EmployeeId == employeeId && b.Year == startDate.Year
            ) ?? throw new Exception("Vacation balance not found for this year.");

        if (absenceType.DeductsFromBalance && balance.RemainingDays < totalDays)
        {
            throw new Exception(
                $"Insufficient balance. Remaining: {balance.RemainingDays}, Requested: {totalDays}."
            );
        }

        var overlapping = await _context.AbsenceRequests.AnyAsync(r =>
            r.EmployeeId == employeeId
            && r.Status != RequestStatus.Cancelled
            && r.Status != RequestStatus.Rejected
            && (
                (startDate >= r.StartDate && startDate <= r.EndDate)
                || (endDate >= r.StartDate && endDate <= r.EndDate)
            )
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

        if (absenceType.DeductsFromBalance)
        {
            balance.UsedDays += totalDays;
        }

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
            var balance =
                await _context.VacationBalances.FirstOrDefaultAsync(b =>
                    b.EmployeeId == employeeId && b.Year == startDate.Year
                ) ?? throw new Exception("Vacation balance not found for this year.");

            if (balance.UsedDays - oldDays + newDays > balance.TotalDays)
            {
                throw new Exception($"Insufficient balance. Requested: {newDays}.");
            }

            balance.UsedDays = balance.UsedDays - oldDays + newDays;
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

        if (
            request.AbsenceType?.RequiresAttachment == true
            && approver.User?.Role != UserRole.HRManager
        )
        {
            throw new Exception(
                "Medical leaves must be validated and approved by an HR Administrator."
            );
        }

        if (approver.User?.Role == UserRole.Manager && request.Status == RequestStatus.Pending)
        {
            request.Status = RequestStatus.PendingCoordinatorApproval;
        }
        else if (
            approver.User?.Role == UserRole.Manager
            || approver.User?.Role == UserRole.HRManager
        )
        {
            request.Status = RequestStatus.Approved;
        }
        else
        {
            throw new Exception(
                "You do not have sufficient permissions to approve this request at this stage."
            );
        }

        request.ApprovalHistories.Add(
            new ApprovalHistory
            {
                Id = Guid.NewGuid(),
                ApproverEmployeeId = approverId,
                Action = ApprovalAction.Approved,
                Comment = comment,
                ActionDate = DateTime.UtcNow,
            }
        );

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
        request.ApprovalHistories.Add(
            new ApprovalHistory
            {
                Id = Guid.NewGuid(),
                ApproverEmployeeId = approverId,
                Action = ApprovalAction.Rejected,
                Comment = $"Modification requested: {comment}",
                ActionDate = DateTime.UtcNow,
            }
        );

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RejectRequestAsync(Guid requestId, Guid approverId, string comment)
    {
        var request =
            await _context
                .AbsenceRequests.Include(r => r.AbsenceType)
                .FirstOrDefaultAsync(r => r.Id == requestId)
            ?? throw new Exception("Request not found.");

        if (request.Status != RequestStatus.Pending)
        {
            throw new Exception("Only pending requests can be rejected.");
        }

        request.Status = RequestStatus.Rejected;
        request.ApprovalHistories.Add(
            new ApprovalHistory
            {
                Id = Guid.NewGuid(),
                ApproverEmployeeId = approverId,
                Action = ApprovalAction.Rejected,
                Comment = comment,
                ActionDate = DateTime.UtcNow,
            }
        );

        if (request.AbsenceType != null && request.AbsenceType.DeductsFromBalance)
        {
            var balance = await _context.VacationBalances.FirstOrDefaultAsync(b =>
                b.EmployeeId == request.EmployeeId && b.Year == request.StartDate.Year
            );
            if (balance != null)
            {
                balance.UsedDays -= request.TotalDaysRequested;
            }
        }

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

        if (request.AbsenceType != null && request.AbsenceType.DeductsFromBalance)
        {
            var balance = await _context.VacationBalances.FirstOrDefaultAsync(b =>
                b.EmployeeId == request.EmployeeId && b.Year == request.StartDate.Year
            );
            if (balance != null)
            {
                balance.UsedDays -= request.TotalDaysRequested;
            }
        }

        await _context.SaveChangesAsync();

        return true;
    }
}
