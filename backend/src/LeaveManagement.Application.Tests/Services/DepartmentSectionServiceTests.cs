using FluentAssertions;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Application.Services;
using LeaveManagement.Application.Tests.Helpers;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Xunit;

namespace LeaveManagement.Application.Tests.Services;

public class DepartmentSectionServiceTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly DepartmentSectionService _sut;

    public DepartmentSectionServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _sut = new DepartmentSectionService(_context);
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnSection_WhenExists()
    {
        var section = new DepartmentSection { Id = Guid.NewGuid(), Name = "Core Engine" };
        _context.DepartmentSections.Add(section);
        await _context.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(section.Id);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Core Engine");
    }

    [Fact]
    public async Task GetByIdsAsync_ShouldReturnDictionary_WhenExist()
    {
        var sections = Enumerable.Range(1, 3).Select(i => new DepartmentSection 
        { 
            Id = Guid.NewGuid(), 
            Name = $"Section {i}" 
        }).ToList();
        _context.DepartmentSections.AddRange(sections);
        await _context.SaveChangesAsync();

        var result = await _sut.GetByIdsAsync(sections.Select(s => s.Id));

        result.Should().HaveCount(3);
    }

}
