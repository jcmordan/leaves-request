using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using GreenDonut;
using LeaveManagement.Api.GraphQL.Resolvers;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Domain.Entities;
using NSubstitute;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.Resolvers;

public class EmployeeResolversTests
{
    private readonly EmployeeResolvers _sut;

    public EmployeeResolversTests()
    {
        _sut = new EmployeeResolvers();
    }

    [Fact]
    public async Task GetCompanyAsync_ShouldCallDataLoader()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var employee = new Employee { CompanyId = companyId };
        var expected = new Company { Id = companyId, Name = "Test Co" };
        var dataLoader = Substitute.For<IDataLoader<Guid, Company>>();
        dataLoader.LoadAsync(companyId, Arg.Any<CancellationToken>()).Returns(expected);

        // Act
        var result = await _sut.GetCompanyAsync(employee, dataLoader, CancellationToken.None);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public async Task GetDepartmentAsync_ShouldCallDataLoader()
    {
        // Arrange
        var departmentId = Guid.NewGuid();
        var employee = new Employee { DepartmentId = departmentId };
        var expected = new Department { Id = departmentId, Name = "IT" };
        var dataLoader = Substitute.For<IDataLoader<Guid, Department>>();
        dataLoader.LoadAsync(departmentId, Arg.Any<CancellationToken>()).Returns(expected);

        // Act
        var result = await _sut.GetDepartmentAsync(employee, dataLoader, CancellationToken.None);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public async Task GetDepartmentSectionAsync_ShouldCallDataLoader()
    {
        // Arrange
        var sectionId = Guid.NewGuid();
        var employee = new Employee { DepartmentSectionId = sectionId };
        var expected = new DepartmentSection { Id = sectionId, Name = "Dev" };
        var dataLoader = Substitute.For<IDataLoader<Guid, DepartmentSection>>();
        dataLoader.LoadAsync(sectionId, Arg.Any<CancellationToken>()).Returns(expected);

        // Act
        var result = await _sut.GetDepartmentSectionAsync(employee, dataLoader, CancellationToken.None);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public async Task GetDepartmentSectionAsync_WhenNull_ShouldReturnNull()
    {
        // Arrange
        var employee = new Employee { DepartmentSectionId = null };
        var dataLoader = Substitute.For<IDataLoader<Guid, DepartmentSection>>();

        // Act
        var result = await _sut.GetDepartmentSectionAsync(employee, dataLoader, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetSubordinatesAsync_ShouldReturnEntries()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var employee = new Employee { Id = employeeId };
        var subordinates = new[] { new Employee { Id = Guid.NewGuid(), ManagerId = employeeId } };
        var dataLoader = Substitute.For<IDataLoader<Guid, Employee[]>>();
        dataLoader.LoadAsync(employeeId, Arg.Any<CancellationToken>()).Returns(subordinates);

        // Act
        var result = await _sut.GetSubordinatesAsync(employee, dataLoader, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result.First().Id.Should().Be(subordinates[0].Id);
    }

    [Fact]
    public async Task GetSubordinatesAsync_WhenNull_ShouldReturnEmpty()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var employee = new Employee { Id = employeeId };
        var dataLoader = Substitute.For<IDataLoader<Guid, Employee[]>>();
        dataLoader.LoadAsync(employeeId, Arg.Any<CancellationToken>()).Returns((Employee[]?)null);

        // Act
        var result = await _sut.GetSubordinatesAsync(employee, dataLoader, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetJobTitleAsync_ShouldCallDataLoader()
    {
        // Arrange
        var jobTitleId = Guid.NewGuid();
        var employee = new Employee { JobTitleId = jobTitleId };
        var expected = new JobTitle { Id = jobTitleId, Name = "Engineer" };
        var dataLoader = Substitute.For<IDataLoader<Guid, JobTitle>>();
        dataLoader.LoadAsync(jobTitleId, Arg.Any<CancellationToken>()).Returns(expected);

        // Act
        var result = await _sut.GetJobTitleAsync(employee, dataLoader, CancellationToken.None);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public async Task GetJobTitleAsync_WhenNull_ShouldReturnNull()
    {
        // Arrange
        var employee = new Employee { JobTitleId = null };
        var dataLoader = Substitute.For<IDataLoader<Guid, JobTitle>>();

        // Act
        var result = await _sut.GetJobTitleAsync(employee, dataLoader, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetManagerAsync_ShouldCallDataLoader()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var employee = new Employee { ManagerId = managerId };
        var expected = new Employee { Id = managerId, FullName = "Manager" };
        var dataLoader = Substitute.For<IDataLoader<Guid, Employee>>();
        dataLoader.LoadAsync(managerId, Arg.Any<CancellationToken>()).Returns(expected);

        // Act
        var result = await _sut.GetManagerAsync(employee, dataLoader, CancellationToken.None);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public async Task GetManagerAsync_WhenNull_ShouldReturnNull()
    {
        // Arrange
        var employee = new Employee { ManagerId = null };
        var dataLoader = Substitute.For<IDataLoader<Guid, Employee>>();

        // Act
        var result = await _sut.GetManagerAsync(employee, dataLoader, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetLeaveBalanceAsync_ShouldCallDataLoader()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var employee = new Employee { Id = employeeId };
        var expected = new LeaveBalanceDto { TotalEntitlement = 20, Taken = 5 };
        var dataLoader = Substitute.For<IDataLoader<Guid, LeaveBalanceDto>>();
        dataLoader.LoadAsync(employeeId, Arg.Any<CancellationToken>()).Returns(expected);

        // Act
        var result = await _sut.GetLeaveBalanceAsync(employee, dataLoader, CancellationToken.None);

        // Assert
        result.Should().Be(expected);
    }
}
