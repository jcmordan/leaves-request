using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using GreenDonut;
using LeaveManagement.Api.GraphQL.DataLoaders;
using LeaveManagement.Api.GraphQL.Resolvers;
using LeaveManagement.Domain.Entities;
using NSubstitute;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.Resolvers;

public class AbsenceRequestResolversTests
{
    private readonly AbsenceRequestResolvers _sut;

    public AbsenceRequestResolversTests()
    {
        _sut = new AbsenceRequestResolvers();
    }

    [Fact]
    public async Task GetRequesterEmployeeAsync_ShouldCallDataLoader()
    {
        // Arrange
        var requesterId = Guid.NewGuid();
        var absenceRequest = new AbsenceRequest { RequesterEmployeeId = requesterId };
        var expectedEmployee = new Employee { Id = requesterId, FullName = "Requester" };
        
        var dataLoader = Substitute.For<IEmployeeByIdDataLoader>();
        dataLoader.LoadAsync(requesterId, Arg.Any<CancellationToken>()).Returns(expectedEmployee);

        // Act
        var result = await _sut.GetRequesterEmployeeAsync(absenceRequest, dataLoader, CancellationToken.None);

        // Assert
        result.Should().Be(expectedEmployee);
    }

    [Fact]
    public async Task GetAbsenceTypeAsync_ShouldCallDataLoader()
    {
        // Arrange
        var typeId = Guid.NewGuid();
        var absenceRequest = new AbsenceRequest { AbsenceTypeId = typeId };
        var expectedType = new AbsenceType { Id = typeId, Name = "Vacation" };
        
        var dataLoader = Substitute.For<IAbsenceTypeByIdDataLoader>();
        dataLoader.LoadAsync(typeId, Arg.Any<CancellationToken>()).Returns(expectedType);

        // Act
        var result = await _sut.GetAbsenceTypeAsync(absenceRequest, dataLoader, CancellationToken.None);

        // Assert
        result.Should().Be(expectedType);
    }

    [Fact]
    public async Task GetAttachmentsAsync_ShouldReturnEntries()
    {
        // Arrange
        var requestId = Guid.NewGuid();
        var absenceRequest = new AbsenceRequest { Id = requestId };
        var attachments = new[] { new Attachment { Id = Guid.NewGuid(), AbsenceRequestId = requestId } };
        
        var dataLoader = Substitute.For<IAttachmentsByAbsenceRequestIdDataLoader>();
        dataLoader.LoadAsync(requestId, Arg.Any<CancellationToken>()).Returns(attachments);

        // Act
        var result = await _sut.GetAttachmentsAsync(absenceRequest, dataLoader, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result.First().Id.Should().Be(attachments[0].Id);
    }

    [Fact]
    public async Task GetAttachmentsAsync_WhenNull_ShouldReturnEmpty()
    {
        // Arrange
        var requestId = Guid.NewGuid();
        var absenceRequest = new AbsenceRequest { Id = requestId };
        
        var dataLoader = Substitute.For<IAttachmentsByAbsenceRequestIdDataLoader>();
        dataLoader.LoadAsync(requestId, Arg.Any<CancellationToken>()).Returns((Attachment[]?)null);

        // Act
        var result = await _sut.GetAttachmentsAsync(absenceRequest, dataLoader, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetEmployeeAsync_ShouldCallDataLoader()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var absenceRequest = new AbsenceRequest { EmployeeId = employeeId };
        var expectedEmployee = new Employee { Id = employeeId, FullName = "Employee" };
        
        var dataLoader = Substitute.For<IEmployeeByIdDataLoader>();
        dataLoader.LoadAsync(employeeId, Arg.Any<CancellationToken>()).Returns(expectedEmployee);

        // Act
        var result = await _sut.GetEmployeeAsync(absenceRequest, dataLoader, CancellationToken.None);

        // Assert
        result.Should().Be(expectedEmployee);
    }

    [Fact]
    public async Task GetApprovalHistoriesAsync_ShouldReturnEntries()
    {
        // Arrange
        var requestId = Guid.NewGuid();
        var absenceRequest = new AbsenceRequest { Id = requestId };
        var histories = new[] { new ApprovalHistory { Id = Guid.NewGuid(), AbsenceRequestId = requestId } };
        
        var dataLoader = Substitute.For<IApprovalHistoriesByAbsenceRequestIdDataLoader>();
        dataLoader.LoadAsync(requestId, Arg.Any<CancellationToken>()).Returns(histories);

        // Act
        var result = await _sut.GetApprovalHistoriesAsync(absenceRequest, dataLoader, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result.First().Id.Should().Be(histories[0].Id);
    }

    [Fact]
    public async Task GetApprovalHistoriesAsync_WhenNull_ShouldReturnEmpty()
    {
        // Arrange
        var requestId = Guid.NewGuid();
        var absenceRequest = new AbsenceRequest { Id = requestId };
        
        var dataLoader = Substitute.For<IApprovalHistoriesByAbsenceRequestIdDataLoader>();
        dataLoader.LoadAsync(requestId, Arg.Any<CancellationToken>()).Returns((ApprovalHistory[]?)null);

        // Act
        var result = await _sut.GetApprovalHistoriesAsync(absenceRequest, dataLoader, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }
}