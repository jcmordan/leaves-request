using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using GreenDonut;
using LeaveManagement.Api.GraphQL.DataLoaders;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.DataLoaders;

public class AbsenceTypeByIdDataLoaderTests : IDisposable
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory;
    private readonly IBatchScheduler _batchScheduler;
    private readonly LeaveManagementDbContext _dbContext;
    private readonly DbContextOptions<LeaveManagementDbContext> _options;

    public AbsenceTypeByIdDataLoaderTests()
    {
        _options = new DbContextOptionsBuilder<LeaveManagementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _dbContext = new LeaveManagementDbContext(_options);
        _dbContext.Database.EnsureCreated();

        _dbContextFactory = Substitute.For<IDbContextFactory<LeaveManagementDbContext>>();
        _dbContextFactory.CreateDbContextAsync(Arg.Any<CancellationToken>())
            .Returns(_ => Task.FromResult(new LeaveManagementDbContext(_options)));

        _batchScheduler = Substitute.For<IBatchScheduler>();
    }

    private class TestAbsenceTypeByIdDataLoader(
        IBatchScheduler batchScheduler,
        DataLoaderOptions options,
        IDbContextFactory<LeaveManagementDbContext> dbContextFactory
    ) : AbsenceTypeByIdDataLoader(batchScheduler, options, dbContextFactory)
    {
        public new Task<IReadOnlyDictionary<Guid, AbsenceType>> LoadBatchAsync(
            IReadOnlyList<Guid> keys,
            CancellationToken cancellationToken
        ) => base.LoadBatchAsync(keys, cancellationToken);
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldReturnRequestedAbsenceTypes()
    {
        // Arrange
        var type1 = new AbsenceType { Id = Guid.NewGuid(), Name = "Annual Leave" };
        var type2 = new AbsenceType { Id = Guid.NewGuid(), Name = "Sick Leave" };
        var type3 = new AbsenceType { Id = Guid.NewGuid(), Name = "Other" };

        _dbContext.AbsenceTypes.AddRange(type1, type2, type3);
        await _dbContext.SaveChangesAsync();

        var sut = new TestAbsenceTypeByIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);
        var keys = new[] { type1.Id, type2.Id };

        // Act
        var result = await sut.LoadBatchAsync(keys, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.Should().ContainKey(type1.Id);
        result.Should().ContainKey(type2.Id);
        result[type1.Id].Name.Should().Be("Annual Leave");
        result[type2.Id].Name.Should().Be("Sick Leave");
    }

    [Fact]
    public async Task LoadBatchAsync_WithMissingKeys_ShouldOnlyReturnExisting()
    {
        // Arrange
        var type1 = new AbsenceType { Id = Guid.NewGuid(), Name = "Annual Leave" };
        _dbContext.AbsenceTypes.Add(type1);
        await _dbContext.SaveChangesAsync();

        var sut = new TestAbsenceTypeByIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);
        var keys = new[] { type1.Id, Guid.NewGuid() };

        // Act
        var result = await sut.LoadBatchAsync(keys, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result.Should().ContainKey(type1.Id);
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldReturnEmpty_WhenKeysAreEmpty()
    {
        // Arrange
        var sut = new TestAbsenceTypeByIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);

        // Act
        var result = await sut.LoadBatchAsync(Array.Empty<Guid>(), CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }
}
