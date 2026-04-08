using LeaveManagement.Infrastructure.Services;
using Xunit;

namespace LeaveManagement.UnitTests;

public class Argon2PasswordHasherTests
{
    private readonly Argon2PasswordHasher _hasher;

    public Argon2PasswordHasherTests()
    {
        _hasher = new Argon2PasswordHasher();
    }

    [Fact]
    public void HashPassword_ShouldReturnEncodedString()
    {
        // Arrange
        var password = "TestPassword123!";

        // Act
        var hash = _hasher.HashPassword(password);

        // Assert
        Assert.NotNull(hash);
        Assert.StartsWith("$argon2id$", hash);
    }

    [Fact]
    public void VerifyPassword_ShouldReturnTrue_ForCorrectPassword()
    {
        // Arrange
        var password = "CorrectPassword123!";
        var hash = _hasher.HashPassword(password);

        // Act
        var result = _hasher.VerifyPassword(password, hash);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void VerifyPassword_ShouldReturnFalse_ForIncorrectPassword()
    {
        // Arrange
        var password = "CorrectPassword123!";
        var wrongPassword = "WrongPassword123!";
        var hash = _hasher.HashPassword(password);

        // Act
        var result = _hasher.VerifyPassword(wrongPassword, hash);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void HashPassword_ShouldProduceDifferentHashes_ForSamePassword()
    {
        // Arrange
        var password = "SamePassword";

        // Act
        var hash1 = _hasher.HashPassword(password);
        var hash2 = _hasher.HashPassword(password);

        // Assert
        Assert.NotEqual(hash1, hash2); // Salts should be different
    }

    [Fact]
    public void VerifyPassword_ShouldHandleNullPassword_Gracefully()
    {
        // Arrange
        var hash = _hasher.HashPassword("somePassword");

        // Act & Assert
#pragma warning disable CS8625 // Cannot convert null literal to non-nullable reference type.
        Assert.False(_hasher.VerifyPassword(null, hash));
#pragma warning restore CS8625
    }
}
