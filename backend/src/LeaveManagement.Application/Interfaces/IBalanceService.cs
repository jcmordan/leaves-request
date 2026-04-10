using LeaveManagement.Application.DTOs;

namespace LeaveManagement.Application.Interfaces;

public interface IBalanceService
{
    Task<LeaveBalanceDto> GetEmployeeBalanceAsync(Guid employeeId, int year, Guid absenceTypeId);
    Task<LeaveBalanceDto> GetEmployeeBalanceSummaryAsync(Guid employeeId, int year);
    Task<int> AccruedDaysForYearAsync(Guid employeeId, int year, Guid absenceTypeId, DateTime? referenceDate = null);
}
