using FluentAssertions;
using LeaveManagement.Api.GraphQL.Mutations;
using LeaveManagement.Domain.Common;
using LeaveManagement.Infrastructure.Models;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.Mutations;

public class LoginPayloadTests
{
    [Fact]
    public void LoginPayload_ShouldInitializeCorrectly()
    {
        // Arrange
        var authResponse = new AuthResponse("token", "email", "name", ["role"]);
        var error = new Error("Code", "Message");

        // Act
        var payload = new LoginPayload(true, authResponse, error);

        // Assert
        payload.Success.Should().BeTrue();
        payload.Data.Should().Be(authResponse);
        payload.Error.Should().Be(error);
    }
}
