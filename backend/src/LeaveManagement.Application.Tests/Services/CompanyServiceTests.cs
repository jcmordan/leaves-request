using FluentAssertions;
using LeaveManagement.Application.Services;
using LeaveManagement.Application.Tests.Helpers;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Xunit;

namespace LeaveManagement.Application.Tests.Services;

public class CompanyServiceTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly CompanyService _sut;

    public CompanyServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _sut = new CompanyService(_context);
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnCompany_WhenExists()
    {
        var company = new Company { Id = Guid.NewGuid(), Name = "Acme Corp" };
        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(company.Id);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Acme Corp");
    }

    [Fact]
    public async Task GetByIdsAsync_ShouldReturnDictionary_WhenExist()
    {
        var c1 = new Company { Id = Guid.NewGuid(), Name = "C1" };
        var c2 = new Company { Id = Guid.NewGuid(), Name = "C2" };
        _context.Companies.AddRange(c1, c2);
        await _context.SaveChangesAsync();

        var result = await _sut.GetByIdsAsync([c1.Id, c2.Id]);

        result.Should().HaveCount(2);
        result.Should().ContainKey(c1.Id);
        result.Should().ContainKey(c2.Id);
    }
}
