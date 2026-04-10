using FluentAssertions;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Domain.Tests;

public class LeaveEntitlementTests
{
    [Fact]
    public void TotalEntitlement_ShouldSumAllDayTypes()
    {
        var entitlement = new LeaveEntitlement
        {
            BaseDays = 15,
            AdditionalDays = 3,
            CarryOverDays = 2,
        };

        entitlement.TotalEntitlement.Should().Be(20);
    }

    [Fact]
    public void TotalEntitlement_WithZeroValues_ShouldReturnZero()
    {
        var entitlement = new LeaveEntitlement
        {
            BaseDays = 0,
            AdditionalDays = 0,
            CarryOverDays = 0,
        };

        entitlement.TotalEntitlement.Should().Be(0);
    }

    [Fact]
    public void TotalEntitlement_WithOnlyBaseDays_ShouldReturnBaseDays()
    {
        var entitlement = new LeaveEntitlement
        {
            BaseDays = 20,
            AdditionalDays = 0,
            CarryOverDays = 0,
        };

        entitlement.TotalEntitlement.Should().Be(20);
    }
}
