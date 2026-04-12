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

public class SubordinatesByEmployeeIdDataLoaderTests : IDisposable
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory;
    private readonly IBatchScheduler _batchScheduler;
    private readonly LeaveManagementDbContext _dbContext;
    private readonly DbContextOptions<LeaveManagementDbContext> _options;

    public SubordinatesByEmployeeIdDataLoaderTests()
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

    private class TestSubordinatesByEmployeeIdDataLoader(
        IBatchScheduler batchScheduler,
        DataLoaderOptions options,
        IDbContextFactory<LeaveManagementDbContext> dbContextFactory
    ) : SubordinatesByEmployeeIdDataLoader(batchScheduler, options, dbContextFactory)
    {
        public new Task<ILookup<Guid, Employee>> LoadGroupedBatchAsync(
            IReadOnlyList<Guid> keys,
            CancellationToken cancellationToken
        ) => base.LoadGroupedBatchAsync(keys, cancellationToken);
    }

    [Fact]
    public async Task LoadGroupedBatchAsync_ShouldReturnSubordinatesGroupedByManagerId()
    {
        // Arrange
        var managerId1 = Guid.NewGuid();
        var managerId2 = Guid.NewGuid();

        var sub1 = new Employee { Id = Guid.NewGuid(), ManagerId = managerId1, FullName = "Sub 1" };
        var sub2 = new Employee { Id = Guid.NewGuid(), ManagerId = managerId1, FullName = "Sub 2" };
        var sub3 = new Employee { Id = Guid.NewGuid(), ManagerId = managerId2, FullName = "Sub 3" };

        _dbContext.Employees.AddRange(sub1, sub2, sub3);
        await _dbContext.SaveChangesAsync();

        var sut = new TestSubordinatesByEmployeeIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);
        var keys = new[] { managerId1, managerId2 };

        // Act
        var result = await sut.LoadGroupedBatchAsync(keys, CancellationToken.None);

        // Assert
        result.Count.Should().Be(2);
        result[managerId1].Should().HaveCount(2);
        result[managerId1].Should().Contain(e => e.FullName == "Sub 1");
        result[managerId1].Should().Contain(e => e.FullName == "Sub 2");
        result[managerId2].Should().HaveCount(1);
        result[managerId2].First().FullName.Should().Be("Sub 3");
    }

    [Fact]
    public async Task LoadGroupedBatchAsync_ShouldReturnEmpty_WhenKeysAreEmpty()
    {
        // Arrange
        var sut = new TestSubordinatesByEmployeeIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);

        // Act
        var result = await sut.LoadGroupedBatchAsync(Array.Empty<Guid>(), CancellationToken.None);

        // Assert
        result.Count.Should().Be(0);
    }

    [Fact]
    public async Task LoadGroupedBatchAsync_ShouldReturnEmptyGroups_WhenKeysDoNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var sut = new TestSubordinatesByEmployeeIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);

        // Act
        var result = await sut.LoadGroupedBatchAsync(new[] { nonExistentId }, CancellationToken.None);

        // Assert
        result.Count.Should().Be(0);
        result[nonExistentId].Should().BeEmpty();
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }
}
