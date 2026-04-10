using FluentAssertions;
using LeaveManagement.Application.DTOs;

namespace LeaveManagement.Domain.Tests;

public class LeaveBalanceDtoTests
{
    [Fact]
    public void AvailablePercentage_WithEntitlement_ShouldCalculateCorrectly()
    {
        var dto = new LeaveBalanceDto
        {
            TotalEntitlement = 20,
            Taken = 5,
            Remaining = 15,
        };

        dto.AvailablePercentage.Should().Be(75.0);
    }

    [Fact]
    public void AvailablePercentage_WhenFullyUsed_ShouldReturnZero()
    {
        var dto = new LeaveBalanceDto
        {
            TotalEntitlement = 20,
            Taken = 20,
            Remaining = 0,
        };

        dto.AvailablePercentage.Should().Be(0.0);
    }

    [Fact]
    public void AvailablePercentage_WhenNoEntitlement_ShouldReturnZero()
    {
        var dto = new LeaveBalanceDto
        {
            TotalEntitlement = 0,
            Taken = 0,
            Remaining = 0,
        };

        dto.AvailablePercentage.Should().Be(0.0);
    }

    [Fact]
    public void AvailablePercentage_ShouldRoundToOneDecimalPlace()
    {
        var dto = new LeaveBalanceDto
        {
            TotalEntitlement = 3,
            Taken = 1,
            Remaining = 2,
        };

        // 2/3 * 100 = 66.666... should round to 66.7
        dto.AvailablePercentage.Should().Be(66.7);
    }
}
