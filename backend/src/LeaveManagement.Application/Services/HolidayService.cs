using System.Net.Http.Json;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;

namespace LeaveManagement.Application.Services;

public class HolidayService : IHolidayService
{
    private readonly LeaveManagementDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;

    public HolidayService(LeaveManagementDbContext context, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<int> CalculateWorkingDaysAsync(DateTime startDate, DateTime endDate)
    {
        if (startDate > endDate)
        {
            return 0;
        }

        var start = DateTime.SpecifyKind(startDate.Date, DateTimeKind.Utc);
        var end = DateTime.SpecifyKind(endDate.Date, DateTimeKind.Utc);

        var holidays = await _context
            .PublicHolidays.AsNoTracking()
            .Where(h => h.Date >= start && h.Date <= end)
            .Select(h => h.Date)
            .ToListAsync();

        int workingDays = 0;
        for (var date = start; date <= end; date = date.AddDays(1))
        {
            if (
                date.DayOfWeek != DayOfWeek.Saturday
                && date.DayOfWeek != DayOfWeek.Sunday
                && !holidays.Any(h => h.Date == date.Date)
            )
            {
                workingDays++;
            }
        }

        return workingDays;
    }

    public async Task<bool> IsHolidayAsync(DateTime date)
    {
        var utcDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        return await _context.PublicHolidays.AsNoTracking().AnyAsync(h => h.Date == utcDate);
    }

    public bool IsWeekendAsync(DateTime date)
    {
        return date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday;
    }

    Task<bool> IHolidayService.IsWeekendAsync(DateTime date)
    {
        return Task.FromResult(IsWeekendAsync(date));
    }

    public async Task<int> SyncPublicHolidaysAsync(int year, string countryCode)
    {
        var client = _httpClientFactory.CreateClient();
        var url = $"https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}";

        var response = await client.GetFromJsonAsync<List<NagerHoliday>>(url);
        if (response == null)
        {
            return 0;
        }

        var existingHolidays = await _context
            .PublicHolidays.Where(h => h.Date.Year == year && h.CountryCode == countryCode)
            .ToListAsync();

        int addedCount = 0;
        foreach (var holiday in response)
        {
            var holidayDate = DateTime.SpecifyKind(holiday.Date.Date, DateTimeKind.Utc);
            if (!existingHolidays.Any(h => h.Date == holidayDate))
            {
                _context.PublicHolidays.Add(
                    new PublicHoliday
                    {
                        Id = Guid.NewGuid(),
                        Date = holidayDate,
                        Name = holiday.LocalName,
                        Description = holiday.Name,
                        CountryCode = countryCode,
                    }
                );
                addedCount++;
            }
        }

        await _context.SaveChangesAsync();
        return addedCount;
    }

    private class NagerHoliday
    {
        public DateTime Date { get; set; }
        public string LocalName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
