using FluentAssertions;
using LeaveManagement.Domain.Common;

namespace LeaveManagement.Domain.Tests;

public class ResultTests
{
    [Fact]
    public void Success_ShouldCreateSuccessResult()
    {
        var result = Result.Success();

        result.IsSuccess.Should().BeTrue();
        result.IsFailure.Should().BeFalse();
        result.Error.Should().Be(Error.None);
    }

    [Fact]
    public void Failure_ShouldCreateFailureResult()
    {
        var error = new Error("Test.Error", "Something went wrong");

        var result = Result.Failure(error);

        result.IsSuccess.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(error);
    }

    [Fact]
    public void Success_WithValue_ShouldReturnValue()
    {
        var value = "test-value";

        var result = Result<string>.Success(value);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(value);
    }

    [Fact]
    public void Failure_WithValue_ShouldThrowOnValueAccess()
    {
        var error = new Error("Test.Error", "Something went wrong");

        var result = Result<string>.Failure(error);

        result.IsFailure.Should().BeTrue();
        var act = () => result.Value;
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void ImplicitConversion_ShouldCreateSuccessResult()
    {
        Result<int> result = 42;

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(42);
    }

    [Fact]
    public void Constructor_SuccessWithError_ShouldThrow()
    {
        // We use a derived class to test the protected constructor
        var act = () => new TestResult(true, new Error("Test", "Error"));

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Success result cannot have an error.");
    }

    [Fact]
    public void Constructor_FailureWithoutError_ShouldThrow()
    {
        var act = () => new TestResult(false, Error.None);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Failure result must have an error.");
    }

    private class TestResult : Result
    {
        public TestResult(bool isSuccess, Error error)
            : base(isSuccess, error) { }
    }
}
