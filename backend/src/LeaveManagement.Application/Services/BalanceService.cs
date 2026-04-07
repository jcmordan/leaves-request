using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;

namespace LeaveManagement.Application.Services;

public class BalanceService : IBalanceService
{
    private readonly LeaveManagementDbContext _context;

    public BalanceService(LeaveManagementDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<VacationBalance>> GetEmployeeBalancesAsync(Guid employeeId)
    {
        return await _context.VacationBalances
            .AsNoTracking()
            .Where(b => b.EmployeeId == employeeId)
            .OrderByDescending(b => b.Year)
            .ToListAsync();
    }

    public async Task<VacationBalance> GetCurrentYearBalanceAsync(Guid employeeId)
    {
        int currentYear = DateTime.UtcNow.Year;
        var balance = await _context.VacationBalances.FirstOrDefaultAsync(b => b.EmployeeId == employeeId && b.Year == currentYear);
        
        if (balance == null)
        {
            // Initial accrual or empty balance if not found
            balance = new VacationBalance
            {
                Id = Guid.NewGuid(),
                EmployeeId = employeeId,
                Year = currentYear,
                TotalDays = 14, // Default DR
                UsedDays = 0,
                CarriedOverDays = 0,
                ExpiresAt = new DateTime(currentYear + 1, 3, 31, 0, 0, 0, DateTimeKind.Utc)
            };
            await _context.VacationBalances.AddAsync(balance);
            await _context.SaveChangesAsync();
        }

        return balance;
    }

    public async Task<int> AccruatedDaysForYearAsync(Guid employeeId, int year)
    {
        var employee = await _context.Employees.FindAsync(employeeId) ?? throw new Exception("Employee not found.");
        return 14;
    }

    public async Task AdjustBalanceAsync(Guid employeeId, int year, int adjustment, string reason)
    {
        var balance = await _context.VacationBalances.FirstOrDefaultAsync(b => b.EmployeeId == employeeId && b.Year == year) ?? throw new Exception("Balance not found for the requested year.");
        
        balance.TotalDays += adjustment;
        await _context.SaveChangesAsync();
    }
}
