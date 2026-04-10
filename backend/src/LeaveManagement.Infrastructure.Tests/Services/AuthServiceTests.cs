using FluentAssertions;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;
using LeaveManagement.Infrastructure.Services;
using LeaveManagement.Infrastructure.Tests.Helpers;
using Microsoft.Extensions.Configuration;
using NSubstitute;
using Xunit;

namespace LeaveManagement.Infrastructure.Tests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher _passwordHasher;
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _configuration = Substitute.For<IConfiguration>();
        _passwordHasher = Substitute.For<IPasswordHasher>();

        // Mock JWT configuration
        var jwtSection = Substitute.For<IConfigurationSection>();
        jwtSection["Key"].Returns("super_secret_key_that_is_long_enough_for_sha256");
        jwtSection["Issuer"].Returns("test_issuer");
        jwtSection["Audience"].Returns("test_audience");
        jwtSection["ExpireHours"].Returns("1");
        _configuration.GetSection("Jwt").Returns(jwtSection);

        _sut = new AuthService(_context, _configuration, _passwordHasher);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnSuccess_WhenCredentialsValid()
    {
        // Arrange
        var email = "user@test.com";
        var password = "password123";
        var hash = "hashed_password";
        var user = new User 
        { 
            Id = Guid.NewGuid(), 
            Email = email, 
            PasswordHash = hash,
            FullName = "Test User",
            Role = UserRole.Employee
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _passwordHasher.VerifyPassword(password, hash).Returns(true);

        // Act
        var result = await _sut.LoginAsync(email, password);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Token.Should().NotBeNullOrEmpty();
        result.Value.Email.Should().Be(email);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnFailure_WhenUserNotFound()
    {
        var result = await _sut.LoginAsync("nonexistent@test.com", "any");

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Auth.InvalidCredentials");
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnFailure_WhenPasswordIncorrect()
    {
        // Arrange
        var email = "user@test.com";
        var hash = "hash";
        _context.Users.Add(new User { Email = email, PasswordHash = hash, FullName = "Name", Role = UserRole.Employee });
        await _context.SaveChangesAsync();

        _passwordHasher.VerifyPassword("wrong", hash).Returns(false);

        // Act
        var result = await _sut.LoginAsync(email, "wrong");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Auth.InvalidCredentials");
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnFailure_WhenPasswordHashMissing()
    {
        var email = "empty@test.com";
        _context.Users.Add(new User { Email = email, PasswordHash = null, FullName = "Name", Role = UserRole.Employee });
        await _context.SaveChangesAsync();

        var result = await _sut.LoginAsync(email, "any");

        result.IsSuccess.Should().BeFalse();
    }
}
