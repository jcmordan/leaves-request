using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using LeaveManagement.Api.GraphQL.Queries;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;
using NSubstitute;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.Queries;

public class HolidayQueriesTests
{
    private readonly IHolidayService _holidayService;
    private readonly HolidayQueries _sut;

    public HolidayQueriesTests()
    {
        _holidayService = Substitute.For<IHolidayService>();
        _sut = new HolidayQueries();
    }

    [Fact]
    public async Task GetPublicHolidays_ShouldCallServiceWithCorrectYear()
    {
        // Arrange
        var year = 2026;
        var expectedHolidays = new List<PublicHoliday> { new() { Name = "New Year", Date = new DateOnly(2026, 1, 1) } };
        _holidayService.GetPublicHolidaysAsync(year).Returns(expectedHolidays);

        // Act
        var result = await _sut.GetPublicHolidays(year, _holidayService);

        // Assert
        result.Should().BeSameAs(expectedHolidays);
        await _holidayService.Received(1).GetPublicHolidaysAsync(year);
    }
}
