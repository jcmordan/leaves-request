using FluentAssertions;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Application.Services;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Application.Tests.Helpers;
using LeaveManagement.Infrastructure.Data;
using Xunit;

namespace LeaveManagement.Application.Tests.Services;

public class DepartmentServiceTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly DepartmentService _sut;

    public DepartmentServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _sut = new DepartmentService(_context);
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnDepartment_WhenExists()
    {
        var dept = new Department { Id = Guid.NewGuid(), Name = "IT" };
        _context.Departments.Add(dept);
        await _context.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(dept.Id);

        result.Should().NotBeNull();
        result!.Name.Should().Be("IT");
    }

    [Fact]
    public async Task GetDepartmentsAsync_ShouldReturnPaginatedList()
    {
        var depts = Enumerable.Range(1, 5).Select(i => new Department 
        { 
            Id = Guid.NewGuid(), 
            Name = $"Dept {i}" 
        }).ToList();
        _context.Departments.AddRange(depts);
        await _context.SaveChangesAsync();

        var result = await _sut.GetDepartmentsAsync(new PaginationFilter { First = 10 });

        result.Items.Should().HaveCount(5);
        result.TotalCount.Should().Be(5);
    }
}
