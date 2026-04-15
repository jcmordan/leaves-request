using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Infrastructure.Data;
using LeaveManagement.Infrastructure.Services;
using LeaveManagement.Infrastructure.Tests.Helpers;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using Xunit;

namespace LeaveManagement.Infrastructure.Tests.Services;

public class CustomClaimsTransformationTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly IServiceProvider _serviceProvider;
    private readonly IServiceScope _serviceScope;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly CustomClaimsTransformation _sut;

    public CustomClaimsTransformationTests()
    {
        _context = TestDbContextFactory.Create();
        
        _serviceProvider = Substitute.For<IServiceProvider>();
        _serviceScope = Substitute.For<IServiceScope>();
        _serviceScopeFactory = Substitute.For<IServiceScopeFactory>();

        _serviceScope.ServiceProvider.Returns(_serviceProvider);
        _serviceScopeFactory.CreateScope().Returns(_serviceScope);
        
        _serviceProvider.GetService(typeof(IServiceScopeFactory)).Returns(_serviceScopeFactory);
        _serviceProvider.GetService(typeof(LeaveManagementDbContext)).Returns(_context);

        _sut = new CustomClaimsTransformation(_serviceProvider);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task TransformAsync_Unauthenticated_ShouldReturnPrincipal()
    {
        var identity = new ClaimsIdentity(); // IsAuthenticated = false
        var principal = new ClaimsPrincipal(identity);

        var result = await _sut.TransformAsync(principal);

        result.Should().Be(principal);
    }

    [Fact]
    public async Task TransformAsync_MissingOid_ShouldReturnPrincipal()
    {
        var identity = new ClaimsIdentity("TestAuth"); // IsAuthenticated = true
        var principal = new ClaimsPrincipal(identity);

        var result = await _sut.TransformAsync(principal);

        result.Should().Be(principal);
    }

    [Fact]
    public async Task TransformAsync_UserExists_ShouldAddRoleClaim()
    {
        // Arrange
        var oid = "test-oid";
        var identity = new ClaimsIdentity("TestAuth");
        identity.AddClaim(new Claim("oid", oid));
        var principal = new ClaimsPrincipal(identity);

        var user = new User
        {
            Id = Guid.NewGuid(),
            ExternalId = oid,
            Email = "test@example.com",
            FullName = "Test User",
            Roles = [UserRole.Admin],
            IsActive = true
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.TransformAsync(principal);

        // Assert
        result.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "Admin").Should().BeTrue();
    }

    [Fact]
    public async Task TransformAsync_UserExists_ShouldAddNameIdentifierClaim()
    {
        // Arrange
        var oid = "test-oid";
        var identity = new ClaimsIdentity("TestAuth");
        identity.AddClaim(new Claim("oid", oid));
        var principal = new ClaimsPrincipal(identity);

        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            ExternalId = oid,
            Email = "test@example.com",
            FullName = "Test User",
            Roles = [UserRole.Employee],
            IsActive = true
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.TransformAsync(principal);

        // Assert
        result.HasClaim(c => c.Type == ClaimTypes.NameIdentifier && c.Value == userId.ToString()).Should().BeTrue();
    }

    [Fact]
    public async Task TransformAsync_UserDoesNotExist_ShouldProvisionUserAndAddRole()
    {
        // Arrange
        var oid = "new-oid";
        var identity = new ClaimsIdentity("TestAuth");
        identity.AddClaim(new Claim("oid", oid));
        identity.AddClaim(new Claim(ClaimTypes.Email, "new@example.com"));
        identity.AddClaim(new Claim(ClaimTypes.Name, "New User"));
        var principal = new ClaimsPrincipal(identity);

        // Act
        var result = await _sut.TransformAsync(principal);

        // Assert
        result.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "Employee").Should().BeTrue();
        
        var userInDb = await _context.Users.FirstOrDefaultAsync(u => u.ExternalId == oid);
        userInDb.Should().NotBeNull();
        userInDb!.Email.Should().Be("new@example.com");
    }

    [Fact]
    public async Task TransformAsync_RoleAlreadyPresent_ShouldNotAddDuplicate()
    {
        // Arrange
        var oid = "test-oid";
        var identity = new ClaimsIdentity("TestAuth");
        identity.AddClaim(new Claim("oid", oid));
        identity.AddClaim(new Claim(ClaimTypes.Role, "Admin"));
        var principal = new ClaimsPrincipal(identity);

        var user = new User
        {
            Id = Guid.NewGuid(),
            ExternalId = oid,
            Email = "test@example.com",
            FullName = "Test User",
            Roles = [UserRole.Admin],
            IsActive = true
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.TransformAsync(principal);

        // Assert
        result.FindAll(ClaimTypes.Role).Count().Should().Be(1);
    }

    [Fact]
    public async Task TransformAsync_MultipleRoles_ShouldAddAllRoleClaims()
    {
        // Arrange
        var oid = "test-oid-multiple";
        var identity = new ClaimsIdentity("TestAuth");
        identity.AddClaim(new Claim("oid", oid));
        var principal = new ClaimsPrincipal(identity);

        var user = new User
        {
            Id = Guid.NewGuid(),
            ExternalId = oid,
            Email = "multiple@example.com",
            FullName = "Multiple Roles User",
            Roles = [UserRole.Manager, UserRole.Admin],
            IsActive = true
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.TransformAsync(principal);

        // Assert
        result.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "Manager").Should().BeTrue();
        result.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "Admin").Should().BeTrue();
        result.FindAll(ClaimTypes.Role).Count().Should().Be(2);
    }
}
