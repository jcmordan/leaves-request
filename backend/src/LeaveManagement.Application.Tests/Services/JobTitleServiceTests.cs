using FluentAssertions;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Application.Services;
using LeaveManagement.Application.Tests.Helpers;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Xunit;

namespace LeaveManagement.Application.Tests.Services;

public class JobTitleServiceTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly JobTitleService _sut;

    public JobTitleServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _sut = new JobTitleService(_context);
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnJobTitle_WhenExists()
    {
        var job = new JobTitle
        {
            Id = Guid.NewGuid(),
            Name = "Engineer",
            Code = "ENG",
        };
        _context.JobTitles.Add(job);
        await _context.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(job.Id);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Engineer");
    }

    [Fact]
    public async Task GetByIdsAsync_ShouldReturnDictionary_WhenExist()
    {
        var jobs = Enumerable.Range(1, 2).Select(i => new JobTitle 
        { 
            Id = Guid.NewGuid(), 
            Name = $"Job {i}",
            Code = $"CODE{i}"
        }).ToList();
        _context.JobTitles.AddRange(jobs);
        await _context.SaveChangesAsync();

        var result = await _sut.GetByIdsAsync(jobs.Select(j => j.Id));

        result.Should().HaveCount(2);
    }
}
