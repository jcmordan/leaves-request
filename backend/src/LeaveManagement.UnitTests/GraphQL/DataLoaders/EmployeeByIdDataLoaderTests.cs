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

public class EmployeeByIdDataLoaderTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory;
    private readonly IBatchScheduler _batchScheduler;
    private readonly DataLoaderOptions _dataLoaderOptions;
    private readonly DbContextOptions<LeaveManagementDbContext> _options;

    public EmployeeByIdDataLoaderTests()
    {
        _options = new DbContextOptionsBuilder<LeaveManagementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new LeaveManagementDbContext(_options);
        _context.Database.EnsureCreated();
 
        _dbContextFactory = new TestDbContextFactory(_options);
        _batchScheduler = Substitute.For<IBatchScheduler>();
        _dataLoaderOptions = new DataLoaderOptions();
    }
 
    private class TestDbContextFactory(DbContextOptions<LeaveManagementDbContext> options) 
        : IDbContextFactory<LeaveManagementDbContext>
    {
        public LeaveManagementDbContext CreateDbContext() => new(options);
        public Task<LeaveManagementDbContext> CreateDbContextAsync(CancellationToken cancellationToken = default) 
            => Task.FromResult(new LeaveManagementDbContext(options));
    }
 
    private class TestEmployeeByIdDataLoader(
        IBatchScheduler batchScheduler,
        DataLoaderOptions options,
        IDbContextFactory<LeaveManagementDbContext> dbContextFactory
    ) : EmployeeByIdDataLoader(batchScheduler, options, dbContextFactory)
    {
        public new Task<IReadOnlyDictionary<Guid, Employee>> LoadBatchAsync(
            IReadOnlyList<Guid> keys,
            CancellationToken cancellationToken
        ) => base.LoadBatchAsync(keys, cancellationToken);
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldReturnEmployees_WhenKeysExist()
    {
        // Arrange
        var employee1 = new Employee { Id = Guid.NewGuid(), FullName = "Emp 1" };
        var employee2 = new Employee { Id = Guid.NewGuid(), FullName = "Emp 2" };
        _context.Employees.AddRange(employee1, employee2);
        await _context.SaveChangesAsync();

        var sut = new TestEmployeeByIdDataLoader(_batchScheduler, _dataLoaderOptions, _dbContextFactory);
 
        // Act
        var result = await sut.LoadBatchAsync(new[] { employee1.Id, employee2.Id }, CancellationToken.None);
 
        // Assert
        result.Values.Should().ContainEquivalentOf(employee1);
        result.Values.Should().ContainEquivalentOf(employee2);
    }
 
    [Fact]
    public async Task LoadBatchAsync_ShouldReturnEmpty_WhenKeysAreEmpty()
    {
        // Arrange
        var sut = new TestEmployeeByIdDataLoader(_batchScheduler, _dataLoaderOptions, _dbContextFactory);
 
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
        var sut = new TestEmployeeByIdDataLoader(_batchScheduler, _dataLoaderOptions, _dbContextFactory);
 
        // Act
        var result = await sut.LoadBatchAsync(new[] { nonExistentId }, CancellationToken.None);
 
        // Assert
        result.Should().BeEmpty();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
