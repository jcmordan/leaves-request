using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Application.Interfaces;

public interface IBalanceService
{
    Task<IEnumerable<VacationBalance>> GetEmployeeBalancesAsync(Guid employeeId);
    Task<VacationBalance> GetCurrentYearBalanceAsync(Guid employeeId);
    Task<int> AccruatedDaysForYearAsync(Guid employeeId, int year);
    Task AdjustBalanceAsync(Guid employeeId, int year, int adjustment, string reason);
}
