using System.Net;
using LeaveManagement.Application.Interfaces;
using System.Text.Json;
using FluentAssertions;
using LeaveManagement.Application.Services;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using LeaveManagement.Application.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace LeaveManagement.Application.Tests.Services;

public class HolidayServiceTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly HolidayService _sut;

    public HolidayServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _httpClientFactory = Substitute.For<IHttpClientFactory>();
        _sut = new HolidayService(_context, _httpClientFactory);
        
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task CalculateWorkingDaysAsync_ShouldExcludeWeekends()
    {
        // Friday to Monday (Friday, Saturday, Sunday, Monday)
        var startDate = new DateTime(2024, 1, 5, 0, 0, 0, DateTimeKind.Utc);
        var endDate = new DateTime(2024, 1, 8, 0, 0, 0, DateTimeKind.Utc);

        var result = await _sut.CalculateWorkingDaysAsync(startDate, endDate);

        // Friday and Monday are working days
        result.Should().Be(2);
    }

    [Fact]
    public async Task CalculateWorkingDaysAsync_ShouldExcludeHolidays()
    {
        var date = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc); // Monday
        _context.PublicHolidays.Add(new PublicHoliday 
        { 
            Id = Guid.NewGuid(), 
            Date = date, 
            Name = "New Year", 
            CountryCode = "US" 
        });
        await _context.SaveChangesAsync();

        var result = await _sut.CalculateWorkingDaysAsync(date, date);

        result.Should().Be(0);
    }

    [Fact]
    public async Task CalculateWorkingDaysAsync_ShouldHandleMixedHolidaysAndWeekends()
    {
        // Friday 2024-01-05 to Tuesday 2024-01-09
        // Friday (Work)
        // Saturday (Weekend)
        // Sunday (Weekend)
        // Monday 2024-01-08 (Holiday)
        // Tuesday (Work)
        
        var startDate = new DateTime(2024, 1, 5, 0, 0, 0, DateTimeKind.Utc);
        var endDate = new DateTime(2024, 1, 9, 0, 0, 0, DateTimeKind.Utc);
        
        var holiday = new DateTime(2024, 1, 8, 0, 0, 0, DateTimeKind.Utc);
        _context.PublicHolidays.Add(new PublicHoliday 
        { 
            Id = Guid.NewGuid(), 
            Date = holiday, 
            Name = "Monday Holiday", 
            CountryCode = "US" 
        });
        await _context.SaveChangesAsync();

        var result = await _sut.CalculateWorkingDaysAsync(startDate, endDate);

        // Friday and Tuesday are working days. Sat/Sun/Mon-holiday are excluded.
        result.Should().Be(2);
    }

    [Fact]
    public async Task CalculateWorkingDaysAsync_ShouldHandleHolidayOnWeekend()
    {
        // Saturday is a holiday
        var saturday = new DateTime(2024, 1, 6, 0, 0, 0, DateTimeKind.Utc);
        _context.PublicHolidays.Add(new PublicHoliday 
        { 
            Id = Guid.NewGuid(), 
            Date = saturday, 
            Name = "Saturday Holiday", 
            CountryCode = "US" 
        });
        await _context.SaveChangesAsync();

        var startDate = new DateTime(2024, 1, 5, 0, 0, 0, DateTimeKind.Utc); // Fri
        var endDate = new DateTime(2024, 1, 8, 0, 0, 0, DateTimeKind.Utc);   // Mon

        var result = await _sut.CalculateWorkingDaysAsync(startDate, endDate);

        // Friday and Monday are working days. Saturday and Sunday are excluded.
        // Even if Saturday is a holiday, it's already excluded as a weekend.
        result.Should().Be(2);
    }

    [Fact]
    public async Task CalculateWorkingDaysAsync_ShouldThrow_WhenStartAfterEnd()
    {
        var startDate = new DateTime(2024, 1, 2);
        var endDate = new DateTime(2024, 1, 1);

        var act = async () => await _sut.CalculateWorkingDaysAsync(startDate, endDate);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task IsHolidayAsync_ShouldReturnTrue_WhenExists()
    {
        var date = new DateTime(2024, 12, 25, 0, 0, 0, DateTimeKind.Utc);
        _context.PublicHolidays.Add(new PublicHoliday 
        { 
            Id = Guid.NewGuid(), 
            Date = date, 
            Name = "Christmas", 
            CountryCode = "US" 
        });
        await _context.SaveChangesAsync();

        var result = await _sut.IsHolidayAsync(date);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task SyncPublicHolidaysAsync_ShouldAddMissingHolidays()
    {
        // Arrange
        var year = 2024;
        var countryCode = "US";
        var holidayData = new[]
        {
            new { date = "2024-01-01", localName = "New Year's Day", name = "New Year's Day" }
        };
        
        var handler = new MockHttpMessageHandler(JsonSerializer.Serialize(holidayData));
        var client = new HttpClient(handler);
        _httpClientFactory.CreateClient().Returns(client);

        // Act
        var result = await _sut.SyncPublicHolidaysAsync(year, countryCode);

        // Assert
        result.Should().Be(1);
        var holiday = await _context.PublicHolidays.FirstOrDefaultAsync(h => h.CountryCode == countryCode);
        holiday.Should().NotBeNull();
        holiday!.Name.Should().Be("New Year's Day");
    }
    [Fact]
    public async Task SyncPublicHolidaysAsync_ShouldSkipExistingHolidays()
    {
        // Arrange
        var year = 2024;
        var countryCode = "US";
        var date = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        
        _context.PublicHolidays.Add(new PublicHoliday 
        { 
            Id = Guid.NewGuid(), 
            Date = date, 
            Name = "Existing", 
            CountryCode = "US" 
        });
        await _context.SaveChangesAsync();

        var holidayData = new[]
        {
            new { date = "2024-01-01", localName = "New Year's Day", name = "New Year's Day" }
        };
        
        var handler = new MockHttpMessageHandler(JsonSerializer.Serialize(holidayData));
        var client = new HttpClient(handler);
        _httpClientFactory.CreateClient().Returns(client);

        // Act
        var result = await _sut.SyncPublicHolidaysAsync(year, countryCode);

        // Assert
        result.Should().Be(0); // Should skip the existing one
        var count = await _context.PublicHolidays.CountAsync();
        count.Should().Be(1);
    }

    [Fact]
    public void IsWeekendAsync_ShouldReturnTrue_ForSaturdayAndSunday()
    {
        var saturday = new DateTime(2024, 1, 6); // Saturday
        var sunday = new DateTime(2024, 1, 7);   // Sunday
        var monday = new DateTime(2024, 1, 8);   // Monday

        _sut.IsWeekendAsync(saturday).Should().BeTrue();
        _sut.IsWeekendAsync(sunday).Should().BeTrue();
        _sut.IsWeekendAsync(monday).Should().BeFalse();
    }

    [Fact]
    public async Task IHolidayService_IsWeekendAsync_ShouldReturnCorrectValue()
    {
        IHolidayService holidayService = _sut;
        var saturday = new DateTime(2024, 1, 6);
        var monday = new DateTime(2024, 1, 8);

        (await holidayService.IsWeekendAsync(saturday)).Should().BeTrue();
        (await holidayService.IsWeekendAsync(monday)).Should().BeFalse();
    }

    [Fact]
    public async Task IsHolidayAsync_ShouldReturnFalse_WhenNotExists()
    {
        var date = new DateTime(2024, 12, 25, 0, 0, 0, DateTimeKind.Utc);
        
        var result = await _sut.IsHolidayAsync(date);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task CalculateWorkingDaysAsync_ShouldReturnZero_WhenOnlyWeekends()
    {
        var startDate = new DateTime(2024, 1, 6, 0, 0, 0, DateTimeKind.Utc); // Sat
        var endDate = new DateTime(2024, 1, 7, 0, 0, 0, DateTimeKind.Utc);   // Sun

        var result = await _sut.CalculateWorkingDaysAsync(startDate, endDate);

        result.Should().Be(0);
    }

    [Fact]
    public async Task SyncPublicHolidaysAsync_ShouldHandleNullResponse()
    {
        _httpClientFactory.CreateClient().Returns(new HttpClient(new MockHttpMessageHandler("null")));

        var result = await _sut.SyncPublicHolidaysAsync(2024, "US");

        result.Should().Be(0);
    }

    private class MockHttpMessageHandler : HttpMessageHandler
    {
        private readonly string _response;

        public MockHttpMessageHandler(string response)
        {
            _response = response;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return Task.FromResult(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(_response, System.Text.Encoding.UTF8, "application/json")
            });
        }
    }
}
