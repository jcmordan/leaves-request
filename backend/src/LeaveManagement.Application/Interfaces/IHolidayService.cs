using System;
using System.Threading.Tasks;

namespace LeaveManagement.Application.Interfaces;

public interface IHolidayService
{
    Task<int> CalculateWorkingDaysAsync(DateOnly startDate, DateOnly endDate);
    Task<bool> IsHolidayAsync(DateOnly date);
    Task<bool> IsWeekendAsync(DateOnly date);
    Task<int> SyncPublicHolidaysAsync(int year, string countryCode);
    Task<List<LeaveManagement.Domain.Entities.PublicHoliday>> GetPublicHolidaysAsync(int year);
}
