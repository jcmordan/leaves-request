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

public class DepartmentByIdDataLoaderTests : IDisposable
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory;
    private readonly IBatchScheduler _batchScheduler;
    private readonly LeaveManagementDbContext _dbContext;
    private readonly DbContextOptions<LeaveManagementDbContext> _options;

    public DepartmentByIdDataLoaderTests()
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

    private class TestDepartmentByIdDataLoader(
        IBatchScheduler batchScheduler,
        DataLoaderOptions options,
        IDbContextFactory<LeaveManagementDbContext> dbContextFactory
    ) : DepartmentByIdDataLoader(batchScheduler, options, dbContextFactory)
    {
        public new Task<IReadOnlyDictionary<Guid, Department>> LoadBatchAsync(
            IReadOnlyList<Guid> keys,
            CancellationToken cancellationToken
        ) => base.LoadBatchAsync(keys, cancellationToken);
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldReturnRequestedDepartments()
    {
        // Arrange
        var dept1 = new Department { Id = Guid.NewGuid(), Name = "IT" };
        var dept2 = new Department { Id = Guid.NewGuid(), Name = "HR" };

        _dbContext.Departments.AddRange(dept1, dept2);
        await _dbContext.SaveChangesAsync();

        var sut = new TestDepartmentByIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);
        var keys = new[] { dept1.Id, dept2.Id };

        // Act
        var result = await sut.LoadBatchAsync(keys, CancellationToken.None);

        // Assert
        result.Should().ContainKey(dept1.Id);
        result.Should().ContainKey(dept2.Id);
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldReturnEmpty_WhenKeysAreEmpty()
    {
        // Arrange
        var sut = new TestDepartmentByIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);

        // Act
        var result = await sut.LoadBatchAsync(Array.Empty<Guid>(), CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldReturnEmpty_WhenKeysDoNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var sut = new TestDepartmentByIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);

        // Act
        var result = await sut.LoadBatchAsync(new[] { nonExistentId }, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }
}
