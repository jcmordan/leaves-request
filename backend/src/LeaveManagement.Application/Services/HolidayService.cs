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

    public async Task<int> CalculateWorkingDaysAsync(DateOnly startDate, DateOnly endDate)
    {
        if (startDate > endDate)
        {
            throw new ArgumentException("Start date must be before or equal to end date.");
        }

        var holidays = await _context
            .PublicHolidays.AsNoTracking()
            .Where(h => h.Date >= startDate && h.Date <= endDate)
            .Select(h => h.Date)
            .ToListAsync();

        int workingDays = 0;
        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            if (
                date.DayOfWeek != DayOfWeek.Saturday
                && date.DayOfWeek != DayOfWeek.Sunday
                && !holidays.Contains(date)
            )
            {
                workingDays++;
            }
        }

        return workingDays;
    }

    public async Task<bool> IsHolidayAsync(DateOnly date)
    {
        return await _context.PublicHolidays.AsNoTracking().AnyAsync(h => h.Date == date);
    }

    public Task<bool> IsWeekendAsync(DateOnly date)
    {
        return Task.FromResult(date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday);
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
            var holidayDate = DateOnly.FromDateTime(holiday.Date);
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
    
    public async Task<List<PublicHoliday>> GetPublicHolidaysAsync(int year)
    {
        return await _context.PublicHolidays.AsNoTracking().Where(h => h.Date.Year == year).ToListAsync();
    }
    
    private class NagerHoliday
    {
        public DateTime Date { get; set; }
        public string LocalName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
