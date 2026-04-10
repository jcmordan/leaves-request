using FluentAssertions;
using LeaveManagement.Application.Common.Paging;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Application.Tests.Helpers;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LeaveManagement.Application.Tests.Common.Paging;

public class PagingHelperTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;

    public PagingHelperTests()
    {
        _context = TestDbContextFactory.Create();
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task ApplyPagingAsync_ShouldReturnFirstPage()
    {
        // Arrange
        var companies = Enumerable.Range(1, 15).Select(i => new Company 
        { 
            Id = Guid.NewGuid(), 
            Name = $"Company {i}" 
        }).ToList();
        
        _context.Companies.AddRange(companies);
        await _context.SaveChangesAsync();

        var filter = new PaginationFilter { First = 10 };

        // Act
        var result = await PagingHelper.ApplyPagingAsync(_context.Companies.AsQueryable(), filter);

        // Assert
        result.Items.Should().HaveCount(10);
        result.HasNextPage.Should().BeTrue();
        result.TotalCount.Should().Be(15);
        result.StartCursor.Should().NotBeNullOrEmpty();
        result.EndCursor.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task ApplyPagingAsync_ShouldReturnNextPage_WhenAfterIsProvided()
    {
        // Arrange
        var companies = Enumerable.Range(1, 15).Select(i => new Company 
        { 
            Id = Guid.NewGuid(), 
            Name = $"Company {i}" 
        }).OrderBy(c => c.Id).ToList(); // Stable sort for testing
        
        _context.Companies.AddRange(companies);
        await _context.SaveChangesAsync();

        // Get first 5
        var firstFilter = new PaginationFilter { First = 5 };
        var firstResult = await PagingHelper.ApplyPagingAsync(_context.Companies.AsQueryable(), firstFilter);
        
        // Act - Get next 5
        var secondFilter = new PaginationFilter { First = 5, After = firstResult.EndCursor };
        var secondResult = await PagingHelper.ApplyPagingAsync(_context.Companies.AsQueryable(), secondFilter);

        // Assert
        secondResult.Items.Should().HaveCount(5);
        secondResult.Items.First().Id.Should().Be(companies[5].Id);
        secondResult.HasPreviousPage.Should().BeTrue();
    }

    [Fact]
    public async Task ApplyPagingAsync_ShouldThrow_WhenPropertyIsNotGuid()
    {
        var query = new List<StringIdEntity> { new StringIdEntity { Id = "1" } }.AsQueryable();
        var filter = new PaginationFilter();

        var act = async () => await PagingHelper.ApplyPagingAsync(query, filter);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*must be of type Guid*");
    }

    private class StringIdEntity
    {
        public string Id { get; set; } = "";
    }
}
