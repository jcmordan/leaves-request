using FluentAssertions;
using LeaveManagement.Api.Extensions;
using LeaveManagement.Domain.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace LeaveManagement.UnitTests.Extensions;

public class ResultExtensionsTests
{
    [Fact]
    public void ToMinimalResult_Success_ShouldReturnOk()
    {
        // Arrange
        var result = Result.Success();

        // Act
        var minimalResult = result.ToMinimalResult();

        // Assert
        minimalResult.GetType().Name.Should().Be("Ok");
    }

    [Fact]
    public void ToMinimalResult_Failure_ShouldReturnProblem()
    {
        // Arrange
        var result = Result.Failure(new Error("User.NotFound", "User not found"));

        // Act
        var minimalResult = result.ToMinimalResult();

        // Assert
        minimalResult.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public void ToMinimalResult_WithValue_Success_ShouldReturnOkWithValue()
    {
        // Arrange
        var result = Result<string>.Success("test");

        // Act
        var minimalResult = result.ToMinimalResult();

        // Assert
        minimalResult.Should().BeOfType<Ok<string>>();
    }

    [Fact]
    public void ToMinimalResult_WithValue_Failure_ShouldReturnProblem()
    {
        // Arrange
        var result = Result<string>.Failure(new Error("Test.Error", "Error"));

        // Act
        var minimalResult = result.ToMinimalResult();

        // Assert
        minimalResult.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public void ToActionResult_Success_ShouldReturnOkResult()
    {
        // Arrange
        var result = Result.Success();

        // Act
        var actionResult = result.ToActionResult();

        // Assert
        actionResult.Should().BeOfType<OkResult>();
    }

    [Fact]
    public void ToActionResult_Failure_ShouldReturnObjectResultWithCorrectStatusCode()
    {
        // Arrange
        var result = Result.Failure(new Error("Test.NotFound", "Not found"));

        // Act
        var actionResult = result.ToActionResult();

        // Assert
        var objectResult = actionResult.Should().BeOfType<ObjectResult>().Subject;
        objectResult.StatusCode.Should().Be(StatusCodes.Status404NotFound);
    }

    [Theory]
    [InlineData("Some.Validation.Error", StatusCodes.Status400BadRequest)]
    [InlineData("Some.Conflict.Error", StatusCodes.Status409Conflict)]
    [InlineData("Some.Unauthorized.Error", StatusCodes.Status401Unauthorized)]
    [InlineData("Some.Forbidden.Error", StatusCodes.Status403Forbidden)]
    [InlineData("Generic.Error", StatusCodes.Status500InternalServerError)]
    public void ToActionResult_DifferentErrorCodes_ShouldReturnCorrectStatusCodes(string errorCode, int expectedStatusCode)
    {
        // Arrange
        var result = Result.Failure(new Error(errorCode, "Error message"));

        // Act
        var actionResult = result.ToActionResult();

        // Assert
        var objectResult = actionResult.Should().BeOfType<ObjectResult>().Subject;
        objectResult.StatusCode.Should().Be(expectedStatusCode);
    }
}
