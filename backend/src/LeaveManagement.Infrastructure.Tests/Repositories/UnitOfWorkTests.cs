using FluentAssertions;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using LeaveManagement.Infrastructure.Repositories;
using LeaveManagement.Infrastructure.Tests.Helpers;
using Xunit;

namespace LeaveManagement.Infrastructure.Tests.Repositories;

public class UnitOfWorkTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly UnitOfWork _sut;

    public UnitOfWorkTests()
    {
        _context = TestDbContextFactory.Create();
        _sut = new UnitOfWork(_context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task CompleteAsync_ShouldPersistChanges()
    {
        _context.AbsenceTypes.Add(new AbsenceType { Id = Guid.NewGuid(), Name = "UoW Test" });

        var result = await _sut.CompleteAsync();

        result.Should().Be(1);
    }

    [Fact]
    public void Dispose_ShouldDisposeContext()
    {
        // Use a local context for this test to avoid double disposal in this class's Dispose()
        var context = TestDbContextFactory.Create();
        var sut = new UnitOfWork(context);

        var act = () => sut.Dispose();

        act.Should().NotThrow();
    }
}
