using System;
using System.Collections.Generic;
using System.Linq;
using HotChocolate;
using LeaveManagement.Api.GraphQL.Filters;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NSubstitute;
using FluentAssertions;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.Filters;

public class GraphQLErrorFilterTests
{
    private readonly ILogger<GraphQLErrorFilter> _logger;
    private readonly IWebHostEnvironment _environment;
    private readonly GraphQLErrorFilter _sut;

    public GraphQLErrorFilterTests()
    {
        _logger = Substitute.For<ILogger<GraphQLErrorFilter>>();
        _environment = Substitute.For<IWebHostEnvironment>();
        _sut = new GraphQLErrorFilter(_logger, _environment);
    }

    [Fact]
    public void OnError_InDevelopment_ShouldIncludeDetails()
    {
        // Arrange
        _environment.EnvironmentName.Returns(Environments.Development);
        var exception = new Exception("Detailed error message");
        var error = ErrorBuilder.New()
            .SetMessage("Original message")
            .SetException(exception)
            .Build();

        // Act
        var result = _sut.OnError(error);

        // Assert
        result.Message.Should().Be("Detailed error message");
        result.Extensions.Should().ContainKey("stackTrace");
        result.Extensions.Should().ContainKey("details");
    }

    [Fact]
    public void OnError_InProduction_ShouldMaskMessage()
    {
        // Arrange
        _environment.EnvironmentName.Returns(Environments.Production);
        var exception = new Exception("Secret internal error");
        var error = ErrorBuilder.New()
            .SetMessage("Original message")
            .SetException(exception)
            .Build();

        // Act
        var result = _sut.OnError(error);

        // Assert
        result.Message.Should().Be("An unexpected error occurred.");
    }

    [Fact]
    public void OnError_WithNoException_ShouldReturnOriginalError()
    {
        // Arrange
        var error = ErrorBuilder.New()
            .SetMessage("Validation error")
            .Build();

        // Act
        var result = _sut.OnError(error);

        // Assert
        result.Should().Be(error);
        result.Message.Should().Be("Validation error");
    }

    [Fact]
    public void OnError_ShouldLogException()
    {
        // Arrange
        _environment.EnvironmentName.Returns(Environments.Production);
        var exception = new Exception("Error to log");
        var error = ErrorBuilder.New()
            .SetMessage("Log this")
            .SetException(exception)
            .Build();

        // Act
        _sut.OnError(error);

        // Assert
        _logger.ReceivedWithAnyArgs().Log(
            LogLevel.Error,
            Arg.Any<EventId>(),
            Arg.Any<object>(),
            exception,
            Arg.Any<Func<object, Exception?, string>>());
    }
}
