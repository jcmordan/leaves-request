using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Application.Services;

public class BalanceService(LeaveManagementDbContext context) : IBalanceService
{
    private readonly LeaveManagementDbContext _context = context;

    public async Task<LeaveBalanceDto> GetEmployeeBalanceAsync(
        Guid employeeId,
        int year,
        Guid absenceTypeId
    )
    {
        var type = await _context.AbsenceTypes.FindAsync(absenceTypeId)
            ?? throw new Exception("Absence type not found.");

        Guid mainTypeId = type.ParentId ?? type.Id;

        var employee =
            await _context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == employeeId)
            ?? throw new Exception("Employee not found.");

        int totalEntitlement = await AccruedDaysForYearAsync(employeeId, year, mainTypeId);

        var linkedTypeIds = await _context.AbsenceTypes
            .Where(t => t.Id == mainTypeId || (t.ParentId == mainTypeId && t.IsSellingType))
            .Select(t => t.Id)
            .ToListAsync();

        var usedDays = await _context
            .AbsenceRequests.AsNoTracking()
            .Where(r =>
                r.EmployeeId == employeeId
                && r.StartDate.Year == year
                && r.Status == RequestStatus.Approved
                && linkedTypeIds.Contains(r.AbsenceTypeId)
            )
            .SumAsync(r => r.TotalDaysRequested);

        var requests = await _context
            .AbsenceRequests.AsNoTracking()
            .Where(r =>
                r.EmployeeId == employeeId 
                && r.StartDate.Year == year 
                && linkedTypeIds.Contains(r.AbsenceTypeId)
            )
            .ToListAsync();

        return new LeaveBalanceDto
        {
            TotalEntitlement = totalEntitlement,
            Taken = usedDays,
            Remaining = totalEntitlement - usedDays,
            TotalRequests = requests.Count,
            PendingRequests = requests.Count(r =>
                r.Status == RequestStatus.Pending
                || r.Status == RequestStatus.PendingCoordinatorApproval
                || r.Status == RequestStatus.ModificationRequested
            ),
            ApprovedRequests = requests.Count(r => r.Status == RequestStatus.Approved),
            RejectedRequests = requests.Count(r => r.Status == RequestStatus.Rejected),
            CancelledRequests = requests.Count(r => r.Status == RequestStatus.Cancelled),
        };
    }

    public async Task<LeaveBalanceDto> GetEmployeeBalanceSummaryAsync(Guid employeeId, int year)
    {
        var types = await _context
            .AbsenceTypes.AsNoTracking()
            .Where(t => t.DeductsFromBalance && t.IsActive)
            .ToListAsync();

        int totalEntitlement = 0;
        int totalTaken = 0;

        foreach (var type in types)
        {
            totalEntitlement += await AccruedDaysForYearAsync(employeeId, year, type.Id);
        }

        totalTaken = await _context
            .AbsenceRequests.AsNoTracking()
            .Where(r =>
                r.EmployeeId == employeeId
                && r.StartDate.Year == year
                && r.Status == RequestStatus.Approved
                && _context.AbsenceTypes.Any(t => t.Id == r.AbsenceTypeId && t.DeductsFromBalance)
            )
            .SumAsync(r => r.TotalDaysRequested);

        var requests = await _context
            .AbsenceRequests.AsNoTracking()
            .Where(r => (r.EmployeeId == employeeId || r.RequesterEmployeeId == employeeId) && r.StartDate.Year == year)
            .ToListAsync();

        return new LeaveBalanceDto
        {
            Id = employeeId,
            EmployeeId = employeeId,
            TotalEntitlement = totalEntitlement,
            Taken = totalTaken,
            Remaining = totalEntitlement - totalTaken,
            TotalRequests = requests.Count,
            PendingRequests = requests.Count(r =>
                r.Status == RequestStatus.Pending
                || r.Status == RequestStatus.PendingCoordinatorApproval
                || r.Status == RequestStatus.ModificationRequested
            ),
            ApprovedRequests = requests.Count(r => r.Status == RequestStatus.Approved),
            RejectedRequests = requests.Count(r => r.Status == RequestStatus.Rejected),
            CancelledRequests = requests.Count(r => r.Status == RequestStatus.Cancelled),
        };
    }

    public async Task<int> AccruedDaysForYearAsync(
        Guid employeeId,
        int year,
        Guid absenceTypeId,
        DateOnly? referenceDate = null
    )
    {
        var entitlement = await _context
            .LeaveEntitlements.AsNoTracking()
            .FirstOrDefaultAsync(e =>
                e.EmployeeId == employeeId && e.Year == year && e.AbsenceTypeId == absenceTypeId
            );

        if (entitlement != null)
        {
            return entitlement.TotalEntitlement;
        }

        var employee =
            await _context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == employeeId)
            ?? throw new Exception("Employee not found.");

        // Calculate tenure as of the reference date (or today)
        var refDate = referenceDate ?? DateOnly.FromDateTime(DateTime.UtcNow);

        // Tenure logic: how many FULL years have passed since HireDate as of refDate
        var tenure = refDate.Year - employee.HireDate.Year;
        if (refDate < employee.HireDate.AddYears(tenure))
        {
            tenure--;
        }

        // Get matching policy from DB
        var policy = await _context
            .EntitlementPolicies.AsNoTracking()
            .Where(p =>
                p.AbsenceTypeId == absenceTypeId && p.MinTenureYears <= tenure && p.IsActive
            )
            .OrderByDescending(p => p.MinTenureYears)
            .FirstOrDefaultAsync();

        return policy?.EntitlementDays ?? 0;
    }
}
