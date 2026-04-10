using FluentAssertions;
using LeaveManagement.Application.Services;
using Xunit;

namespace LeaveManagement.Application.Tests.Services;

public class MockCurrentUserServiceTests
{
    private readonly MockCurrentUserService _sut;

    public MockCurrentUserServiceTests()
    {
        _sut = new MockCurrentUserService();
    }

    [Fact]
    public async Task Should_SetAndGetCurrentUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var userEmail = "test@example.com";
        var uid = "test-uid";

        // Act
        _sut.MockEmployeeId = userId;
        _sut.MockUserEmail = userEmail;
        _sut.MockUserId = uid;

        // Assert
        (await _sut.GetCurrentEmployeeIdAsync()).Should().Be(userId);
        _sut.GetUserEmail().Should().Be(userEmail);
        _sut.GetCurrentUserId().Should().Be(uid);
    }

    [Fact]
    public async Task Should_HaveDefaultValues()
    {
        // Assert
        (await _sut.GetCurrentEmployeeIdAsync()).Should().NotBeEmpty();
        _sut.GetCurrentUserId().Should().Be("mock-user-id");
        _sut.GetUserEmail().Should().Be("mock.user@example.com");
    }
}
