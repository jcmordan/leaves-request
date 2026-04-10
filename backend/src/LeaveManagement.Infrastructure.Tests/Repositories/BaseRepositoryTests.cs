using FluentAssertions;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using LeaveManagement.Infrastructure.Repositories;
using LeaveManagement.Infrastructure.Tests.Helpers;
using Xunit;

namespace LeaveManagement.Infrastructure.Tests.Repositories;

public class BaseRepositoryTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly BaseRepository<AbsenceType> _sut;

    public BaseRepositoryTests()
    {
        _context = TestDbContextFactory.Create();
        _sut = new BaseRepository<AbsenceType>(_context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task AddAsync_And_GetByIdAsync_ShouldWork()
    {
        var entity = new AbsenceType { Id = Guid.NewGuid(), Name = "Vacation" };
        
        await _sut.AddAsync(entity);
        await _context.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(entity.Id);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Vacation");
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAll()
    {
        _context.AbsenceTypes.AddRange(new List<AbsenceType>
        {
            new AbsenceType { Id = Guid.NewGuid(), Name = "A" },
            new AbsenceType { Id = Guid.NewGuid(), Name = "B" }
        });
        await _context.SaveChangesAsync();

        var result = await _sut.GetAllAsync();

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task FindAsync_ShouldReturnMatching()
    {
        var id = Guid.NewGuid();
        _context.AbsenceTypes.Add(new AbsenceType { Id = id, Name = "Target" });
        _context.AbsenceTypes.Add(new AbsenceType { Id = Guid.NewGuid(), Name = "Other" });
        await _context.SaveChangesAsync();

        var result = await _sut.FindAsync(x => x.Name == "Target");

        result.Should().ContainSingle();
        result.First().Id.Should().Be(id);
    }

    [Fact]
    public async Task Update_ShouldModifyEntity()
    {
        var entity = new AbsenceType { Id = Guid.NewGuid(), Name = "Original" };
        _context.AbsenceTypes.Add(entity);
        await _context.SaveChangesAsync();

        entity.Name = "Updated";
        _sut.Update(entity);
        await _context.SaveChangesAsync();

        var result = await _context.AbsenceTypes.FindAsync(entity.Id);
        result!.Name.Should().Be("Updated");
    }

    [Fact]
    public async Task Remove_ShouldDeleteEntity()
    {
        var entity = new AbsenceType { Id = Guid.NewGuid(), Name = "ToDelete" };
        _context.AbsenceTypes.Add(entity);
        await _context.SaveChangesAsync();

        _sut.Remove(entity);
        await _context.SaveChangesAsync();

        var result = await _context.AbsenceTypes.FindAsync(entity.Id);
        result.Should().BeNull();
    }
}
