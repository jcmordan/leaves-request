using LeaveManagement.Application.DTOs;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Api.GraphQL.DataLoaders;

public class LeaveBalanceDataLoader(
    IBatchScheduler batchScheduler,
    DataLoaderOptions options,
    IDbContextFactory<LeaveManagementDbContext> dbContextFactory
) : BatchDataLoader<Guid, LeaveBalanceDto>(batchScheduler, options)
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory = dbContextFactory;

    protected override async Task<IReadOnlyDictionary<Guid, LeaveBalanceDto>> LoadBatchAsync(
        IReadOnlyList<Guid> keys,
        CancellationToken cancellationToken
    )
    {
        await using var context = await _dbContextFactory.CreateDbContextAsync(cancellationToken);
        int currentYear = DateTime.UtcNow.Year;

        // 1. Fetch relevant Absence Types
        var absenceTypes = await context.AbsenceTypes
            .AsNoTracking()
            .Where(t => t.DeductsFromBalance && t.IsActive)
            .ToListAsync(cancellationToken);

        // 2. Fetch Employees (for tenure calculation)
        var employees = await context.Employees
            .AsNoTracking()
            .Where(e => keys.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id, cancellationToken);

        // 3. Fetch all Leave Entitlements for the batch
        var entitlements = await context.LeaveEntitlements
            .AsNoTracking()
            .Where(e => keys.Contains(e.EmployeeId) && e.Year == currentYear)
            .ToListAsync(cancellationToken);

        // 4. Fetch all Entitlement Policies
        var policies = await context.EntitlementPolicies
            .AsNoTracking()
            .Where(p => p.IsActive)
            .ToListAsync(cancellationToken);

        // 5. Fetch Absence Request Summaries
        var requests = await context.AbsenceRequests
            .AsNoTracking()
            .Where(r => 
                keys.Contains(r.EmployeeId) && 
                r.StartDate.Year == currentYear && 
                r.Status == RequestStatus.Approved)
            .GroupBy(r => new { r.EmployeeId, r.AbsenceTypeId })
            .Select(g => new
            {
                g.Key.EmployeeId,
                g.Key.AbsenceTypeId,
                TotalTaken = g.Sum(r => r.TotalDaysRequested)
            })
            .ToListAsync(cancellationToken);

        var result = new Dictionary<Guid, LeaveBalanceDto>();

        foreach (var employeeId in keys)
        {
            if (!employees.TryGetValue(employeeId, out var employee))
            {
                continue;
            }

            int totalEntitlement = 0;
            int totalTaken = 0;

            foreach (var type in absenceTypes)
            {
                // Check for manual override first
                var manualEntitlement = entitlements.FirstOrDefault(e => 
                    e.EmployeeId == employeeId && e.AbsenceTypeId == type.Id);

                if (manualEntitlement != null)
                {
                    totalEntitlement += manualEntitlement.TotalEntitlement;
                }
                else
                {
                    // Calculate tenure
                    var tenure = currentYear - employee.HireDate.Year;
                    if (DateTime.UtcNow < employee.HireDate.AddYears(tenure))
                    {
                        tenure--;
                    }

                    // Find matching policy
                    var policy = policies
                        .Where(p => p.AbsenceTypeId == type.Id && p.MinTenureYears <= tenure)
                        .OrderByDescending(p => p.MinTenureYears)
                        .FirstOrDefault();

                    totalEntitlement += policy?.EntitlementDays ?? 0;
                }

                // Add taken days
                var takenForType = requests.FirstOrDefault(r => 
                    r.EmployeeId == employeeId && r.AbsenceTypeId == type.Id)?.TotalTaken ?? 0;
                
                totalTaken += takenForType;
            }

            result[employeeId] = new LeaveBalanceDto
            {
                TotalEntitlement = totalEntitlement,
                Taken = totalTaken,
                Remaining = totalEntitlement - totalTaken
            };
        }

        return result;
    }
}
