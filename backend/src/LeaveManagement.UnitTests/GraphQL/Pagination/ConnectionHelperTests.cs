using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using HotChocolate.Types.Pagination;
using LeaveManagement.Api.GraphQL.Pagination;
using LeaveManagement.Application.Models.Paging;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.Pagination;

public class ConnectionHelperTests
{
    private class TestNode
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    private class NodeWithoutId
    {
        public string Name { get; set; } = string.Empty;
    }

    [Fact]
    public void ToConnection_ShouldMapCorrectly()
    {
        // Arrange
        var nodes = new List<TestNode>
        {
            new() { Id = Guid.NewGuid(), Name = "Node 1" },
            new() { Id = Guid.NewGuid(), Name = "Node 2" }
        };

        var paginationResult = new PaginationResult<TestNode>
        {
            Items = nodes,
            TotalCount = 10,
            HasNextPage = true,
            HasPreviousPage = false,
            StartCursor = "start",
            EndCursor = "end"
        };

        // Act
        var result = paginationResult.ToConnection();

        // Assert
        result.Edges.Should().HaveCount(2);
        result.Edges.First().Node.Name.Should().Be("Node 1");
        result.Edges.Last().Node.Name.Should().Be("Node 2");
        result.Info.HasNextPage.Should().BeTrue();
        result.Info.HasPreviousPage.Should().BeFalse();
        result.Info.StartCursor.Should().Be("start");
        result.Info.EndCursor.Should().Be("end");
    }

    [Fact]
    public void ToConnection_WithEmptyItems_ShouldReturnEmptyEdges()
    {
        // Arrange
        var paginationResult = new PaginationResult<TestNode>
        {
            Items = new List<TestNode>(),
            TotalCount = 0,
            HasNextPage = false,
            HasPreviousPage = false,
            StartCursor = null,
            EndCursor = null
        };

        // Act
        var result = paginationResult.ToConnection();

        // Assert
        result.Edges.Should().BeEmpty();
        result.Info.HasNextPage.Should().BeFalse();
    }

    [Fact]
    public void ToConnection_ShouldThrow_WhenNodeMissingIdProperty()
    {
        // Arrange
        var nodes = new List<NodeWithoutId> { new() { Name = "Invalid" } };
        var paginationResult = new PaginationResult<NodeWithoutId> { Items = nodes };

        // Act
        Action act = () => paginationResult.ToConnection();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("Type NodeWithoutId does not have a Guid Id property.");
    }
}
