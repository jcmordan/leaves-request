using System;
using LeaveManagement.Api.GraphQL.InputTypes;
using FluentAssertions;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.InputTypes;

public class InputTypesTests
{
    [Fact]
    public void SubmitLeaveRequestInput_ShouldInitializeCorrectly()
    {
        // Arrange
        var absenceTypeId = Guid.NewGuid();
        var startDate = DateTime.UtcNow;
        var endDate = DateTime.UtcNow.AddDays(1);
        var reason = "Test reason";

        // Act
        var input = new SubmitLeaveRequestInput(null, absenceTypeId, startDate, endDate, reason);

        // Assert
        input.AbsenceTypeId.Should().Be(absenceTypeId);
        input.StartDate.Should().Be(startDate);
        input.EndDate.Should().Be(endDate);
        input.Reason.Should().Be(reason);
    }

    [Fact]
    public void ApproveLeaveRequestInput_ShouldInitializeCorrectly()
    {
        // Arrange
        var requestId = Guid.NewGuid();
        var comment = "Approved";

        // Act
        var input = new ApproveLeaveRequestInput(requestId, comment);

        // Assert
        input.RequestId.Should().Be(requestId);
        input.Comment.Should().Be(comment);
    }

    [Fact]
    public void RejectLeaveRequestInput_ShouldInitializeCorrectly()
    {
        // Arrange
        var requestId = Guid.NewGuid();
        var comment = "Rejected";

        // Act
        var input = new RejectLeaveRequestInput(requestId, comment);

        // Assert
        input.RequestId.Should().Be(requestId);
        input.Comment.Should().Be(comment);
    }

    [Fact]
    public void CreateEmployeeInput_ShouldInitializeCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid();
        var hireDate = DateTime.UtcNow;

        // Act
        var input = new CreateEmployeeInput("Full Name", "email@test.com", "CODE", "NID", id, hireDate);

        // Assert
        input.FullName.Should().Be("Full Name");
        input.Email.Should().Be("email@test.com");
        input.HireDate.Should().Be(hireDate);
    }

    [Fact]
    public void UpdateEmployeeInput_ShouldInitializeCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid();
        var deptId = Guid.NewGuid();
        var compId = Guid.NewGuid();

        // Act
        var input = new UpdateEmployeeInput(id, "Name", "e", "C", "N", deptId, DateTime.UtcNow, true, "A", null, null, compId, null);

        // Assert
        input.Id.Should().Be(id);
        input.DepartmentId.Should().Be(deptId);
        input.CompanyId.Should().Be(compId);
    }
}
