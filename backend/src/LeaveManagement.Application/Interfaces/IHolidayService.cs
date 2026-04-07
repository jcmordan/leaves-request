using System;
using System.Threading.Tasks;

namespace LeaveManagement.Application.Interfaces;

public interface IHolidayService
{
    Task<int> CalculateWorkingDaysAsync(DateTime startDate, DateTime endDate);
    Task<bool> IsHolidayAsync(DateTime date);
    Task<bool> IsWeekendAsync(DateTime date);
    Task<int> SyncPublicHolidaysAsync(int year, string countryCode);
}
