using FluentAssertions;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Domain.Tests;

public class EmployeeStatsTests
{
    [Fact]
    public void Record_ShouldStoreAllValues()
    {
        var stats = new EmployeeStats(100, 80, 15, 5);

        stats.Total.Should().Be(100);
        stats.Active.Should().Be(80);
        stats.Inactive.Should().Be(15);
        stats.OnLeave.Should().Be(5);
    }

    [Fact]
    public void Record_EqualityCheck_ShouldWorkByValue()
    {
        var stats1 = new EmployeeStats(10, 8, 1, 1);
        var stats2 = new EmployeeStats(10, 8, 1, 1);

        stats1.Should().Be(stats2);
    }

    [Fact]
    public void Record_InequalityCheck_ShouldDetectDifferences()
    {
        var stats1 = new EmployeeStats(10, 8, 1, 1);
        var stats2 = new EmployeeStats(10, 7, 2, 1);

        stats1.Should().NotBe(stats2);
    }
}
