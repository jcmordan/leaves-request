using LeaveManagement.Infrastructure.Services;
using Xunit;

namespace LeaveManagement.Infrastructure.Tests;

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
        Assert.False(_hasher.VerifyPassword(null!, hash));
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    [InlineData("plain_password")]
    [InlineData("$argon2id$v=123")]
    [InlineData("$argon2id$v=19$m=65536,t=3,p=4$salt_only")]
    public void VerifyPassword_ShouldReturnFalse_ForMalformedHashes(string? malformedHash)
    {
        // Act
        var result = _hasher.VerifyPassword("password", malformedHash!);

        // Assert
        Assert.False(result);
    }

    [Theory]
    [InlineData("$argon2id$v=19$m=0,t=3,p=4$salt$hash")] // Zero memory
    [InlineData("$argon2id$v=19$m=65536,t=0,p=4$salt$hash")] // Zero iterations
    [InlineData("$argon2id$v=19$m=65536,t=3,p=0$salt$hash")] // Zero parallelism
    [InlineData("$argon2id$v=19$m=65536,t=3,p=4$invalid_base64$hash")] // Invalid salt
    [InlineData("$argon2id$v=19$invalid_config$salt$hash")] // Invalid config
    public void VerifyPassword_ShouldReturnFalse_ForInvalidParameters(string invalidHash)
    {
        // Act
        var result = _hasher.VerifyPassword("password", invalidHash);

        // Assert
        Assert.False(result);
    }
}
