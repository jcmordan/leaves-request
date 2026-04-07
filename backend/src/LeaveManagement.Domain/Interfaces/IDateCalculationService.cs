using System;
using System.Threading.Tasks;
using LeaveManagement.Domain.Enums;

namespace LeaveManagement.Domain.Interfaces;

public interface IDateCalculationService
{
    Task<DateTime> CalculateEndDateAsync(DateTime startDate, decimal requestedDays, Guid absenceTypeId);
    Task<decimal> CountWorkingDaysAsync(DateTime startDate, DateTime endDate, Guid absenceTypeId);
}
