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

public class CompanyByIdDataLoaderTests : IDisposable
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory;
    private readonly IBatchScheduler _batchScheduler;
    private readonly LeaveManagementDbContext _dbContext;
    private readonly DbContextOptions<LeaveManagementDbContext> _options;

    public CompanyByIdDataLoaderTests()
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

    private class TestCompanyByIdDataLoader(
        IBatchScheduler batchScheduler,
        DataLoaderOptions options,
        IDbContextFactory<LeaveManagementDbContext> dbContextFactory
    ) : CompanyByIdDataLoader(batchScheduler, options, dbContextFactory)
    {
        public new Task<IReadOnlyDictionary<Guid, Company>> LoadBatchAsync(
            IReadOnlyList<Guid> keys,
            CancellationToken cancellationToken
        ) => base.LoadBatchAsync(keys, cancellationToken);
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldReturnRequestedCompanies()
    {
        // Arrange
        var company1 = new Company { Id = Guid.NewGuid(), Name = "Company 1" };
        var company2 = new Company { Id = Guid.NewGuid(), Name = "Company 2" };
        var company3 = new Company { Id = Guid.NewGuid(), Name = "Company 3" };

        _dbContext.Companies.AddRange(company1, company2, company3);
        await _dbContext.SaveChangesAsync();

        var sut = new TestCompanyByIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);
        var keys = new[] { company1.Id, company2.Id };

        // Act
        var result = await sut.LoadBatchAsync(keys, CancellationToken.None);

        // Assert
        result.Should().ContainKey(company1.Id);
        result.Should().ContainKey(company2.Id);
        result[company1.Id].Name.Should().Be("Company 1");
        result[company2.Id].Name.Should().Be("Company 2");
    }

    [Fact]
    public async Task LoadBatchAsync_ShouldReturnEmpty_WhenKeysAreEmpty()
    {
        // Arrange
        var sut = new TestCompanyByIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);

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
        var sut = new TestCompanyByIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);

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
