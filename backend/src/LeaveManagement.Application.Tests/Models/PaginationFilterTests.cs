using FluentAssertions;
using LeaveManagement.Application.Models.Paging;
using Xunit;

namespace LeaveManagement.Application.Tests.Models;

public class PaginationFilterTests
{
    [Fact]
    public void Constructor_WithParameters_ShouldSetProperties()
    {
        var first = 10;
        var after = "cursor1";
        var last = 5;
        var before = "cursor2";

        var filter = new PaginationFilter(first, after, last, before);

        filter.First.Should().Be(first);
        filter.After.Should().Be(after);
        filter.Last.Should().Be(last);
        filter.Before.Should().Be(before);
    }

    [Fact]
    public void Constructor_Default_ShouldHaveNullProperties()
    {
        var filter = new PaginationFilter();

        filter.First.Should().BeNull();
        filter.After.Should().BeNull();
        filter.Last.Should().BeNull();
        filter.Before.Should().BeNull();
    }

    [Fact]
    public void Properties_ShouldBeSettable()
    {
        var filter = new PaginationFilter();
        
        filter.First = 20;
        filter.After = "a";
        filter.Last = 10;
        filter.Before = "b";

        filter.First.Should().Be(20);
        filter.After.Should().Be("a");
        filter.Last.Should().Be(10);
        filter.Before.Should().Be("b");
    }
}
