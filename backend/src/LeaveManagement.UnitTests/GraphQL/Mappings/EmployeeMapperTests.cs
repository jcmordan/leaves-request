using System;
using FluentAssertions;
using LeaveManagement.Api.GraphQL.InputTypes;
using LeaveManagement.Api.GraphQL.Mappings;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.Mappings;

public class EmployeeMapperTests
{
    [Fact]
    public void ToDomain_ShouldMapAllFieldsCorrectly()
    {
        // Arrange
        var input = new UpdateEmployeeInput(
            Id: Guid.NewGuid(),
            FullName: "Test User",
            Email: "test@example.com",
            EmployeeCode: "EMP001",
            NationalId: "NID001",
            DepartmentId: Guid.NewGuid(),
            HireDate: new DateOnly(2020, 1, 1),
            IsActive: true,
            An8: "AN8-123",
            JobTitleId: Guid.NewGuid(),
            DepartmentSectionId: Guid.NewGuid(),
            CompanyId: Guid.NewGuid(),
            ManagerId: Guid.NewGuid()
        );

        // Act
        var result = EmployeeMapper.ToDomain(input);

        // Assert
        result.Id.Should().Be(input.Id);
        result.FullName.Should().Be(input.FullName);
        result.Email.Should().Be(input.Email);
        result.EmployeeCode.Should().Be(input.EmployeeCode);
        result.NationalId.Should().Be(input.NationalId);
        result.DepartmentId.Should().Be(input.DepartmentId);
        result.HireDate.Should().Be(input.HireDate);
        result.IsActive.Should().Be(input.IsActive);
        result.AN8.Should().Be(input.An8);
        result.JobTitleId.Should().Be(input.JobTitleId);
        result.DepartmentSectionId.Should().Be(input.DepartmentSectionId);
        result.CompanyId.Should().Be(input.CompanyId);
        result.ManagerId.Should().Be(input.ManagerId);
    }

    [Fact]
    public void ToDomain_WithNullOptionals_ShouldMapNullsCorrectly()
    {
        // Arrange
        var input = new UpdateEmployeeInput(
            Id: Guid.NewGuid(),
            FullName: "Test User",
            Email: null,
            EmployeeCode: "EMP001",
            NationalId: "NID001",
            DepartmentId: Guid.NewGuid(),
            HireDate: new DateOnly(2020, 1, 1),
            IsActive: true,
            An8: "AN8-123",
            JobTitleId: null,
            DepartmentSectionId: null,
            CompanyId: Guid.NewGuid(),
            ManagerId: null
        );

        // Act
        var result = EmployeeMapper.ToDomain(input);

        // Assert
        result.Email.Should().BeNull();
        result.JobTitleId.Should().BeNull();
        result.DepartmentSectionId.Should().BeNull();
        result.ManagerId.Should().BeNull();
    }
}
