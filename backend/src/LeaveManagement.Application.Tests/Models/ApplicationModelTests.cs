using FluentAssertions;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Models.Paging;
using Xunit;

namespace LeaveManagement.Application.Tests.Models;

public class ApplicationModelTests
{
    [Fact]
    public void PaginationFilter_Should_SetAndGetProperties()
    {
        var filter = new PaginationFilter
        {
            First = 20,
            After = "cursor",
            Last = 10,
            Before = "before"
        };

        filter.First.Should().Be(20);
        filter.After.Should().Be("cursor");
        filter.Last.Should().Be(10);
        filter.Before.Should().Be("before");
    }

    [Fact]
    public void PaginationResult_Should_SetAndGetProperties()
    {
        var items = new List<string> { "a", "b" };
        var result = new PaginationResult<string>
        {
            Items = items,
            TotalCount = 10,
            HasNextPage = true,
            HasPreviousPage = false,
            StartCursor = "start",
            EndCursor = "end"
        };

        result.Items.Should().BeEquivalentTo(items);
        result.TotalCount.Should().Be(10);
        result.HasNextPage.Should().BeTrue();
        result.HasPreviousPage.Should().BeFalse();
        result.StartCursor.Should().Be("start");
        result.EndCursor.Should().Be("end");
    }

    [Fact]
    public void LeaveBalanceDto_Should_SetAndGetProperties()
    {
        var dto = new LeaveBalanceDto
        {
            TotalEntitlement = 20,
            Taken = 5,
            Remaining = 15
        };

        dto.TotalEntitlement.Should().Be(20);
        dto.Taken.Should().Be(5);
        dto.Remaining.Should().Be(15);
        dto.AvailablePercentage.Should().Be(75.0);
    }

    [Fact]
    public void LeaveBalanceDto_Should_ReturnZeroPercentage_WhenEntitlementIsZero()
    {
        var dto = new LeaveBalanceDto
        {
            TotalEntitlement = 0,
            Remaining = 0
        };

        dto.AvailablePercentage.Should().Be(0);
    }
}
