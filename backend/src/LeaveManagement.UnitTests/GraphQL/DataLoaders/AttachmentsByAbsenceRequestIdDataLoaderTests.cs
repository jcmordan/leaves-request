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

public class AttachmentsByAbsenceRequestIdDataLoaderTests : IDisposable
{
    private readonly IDbContextFactory<LeaveManagementDbContext> _dbContextFactory;
    private readonly IBatchScheduler _batchScheduler;
    private readonly LeaveManagementDbContext _dbContext;
    private readonly DbContextOptions<LeaveManagementDbContext> _options;

    public AttachmentsByAbsenceRequestIdDataLoaderTests()
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

    private class TestAttachmentsByAbsenceRequestIdDataLoader(
        IBatchScheduler batchScheduler,
        DataLoaderOptions options,
        IDbContextFactory<LeaveManagementDbContext> dbContextFactory
    ) : AttachmentsByAbsenceRequestIdDataLoader(batchScheduler, options, dbContextFactory)
    {
        public new Task<ILookup<Guid, Attachment>> LoadGroupedBatchAsync(
            IReadOnlyList<Guid> keys,
            CancellationToken cancellationToken
        ) => base.LoadGroupedBatchAsync(keys, cancellationToken);
    }

    [Fact]
    public async Task LoadGroupedBatchAsync_ShouldReturnAttachmentsGroupedByRequestId()
    {
        // Arrange
        var requestId1 = Guid.NewGuid();
        var requestId2 = Guid.NewGuid();

        var attachment1 = new Attachment { Id = Guid.NewGuid(), AbsenceRequestId = requestId1, FileName = "file1.pdf", FileType = "pdf", UploadedAt = DateTime.UtcNow };
        var attachment2 = new Attachment { Id = Guid.NewGuid(), AbsenceRequestId = requestId1, FileName = "file2.jpg", FileType = "jpg", UploadedAt = DateTime.UtcNow };
        var attachment3 = new Attachment { Id = Guid.NewGuid(), AbsenceRequestId = requestId2, FileName = "file3.png", FileType = "png", UploadedAt = DateTime.UtcNow };

        _dbContext.Attachments.AddRange(attachment1, attachment2, attachment3);
        await _dbContext.SaveChangesAsync();

        var sut = new TestAttachmentsByAbsenceRequestIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);
        var keys = new[] { requestId1, requestId2 };

        // Act
        var result = await sut.LoadGroupedBatchAsync(keys, CancellationToken.None);

        // Assert
        result.Count.Should().Be(2);
        result[requestId1].Should().HaveCount(2);
        result[requestId1].Should().Contain(a => a.FileName == "file1.pdf");
        result[requestId1].Should().Contain(a => a.FileName == "file2.jpg");
        result[requestId2].Should().HaveCount(1);
        result[requestId2].First().FileName.Should().Be("file3.png");
    }

    [Fact]
    public async Task LoadGroupedBatchAsync_ShouldReturnEmpty_WhenKeysAreEmpty()
    {
        // Arrange
        var sut = new TestAttachmentsByAbsenceRequestIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);

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
        var sut = new TestAttachmentsByAbsenceRequestIdDataLoader(_batchScheduler, new DataLoaderOptions(), _dbContextFactory);

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
