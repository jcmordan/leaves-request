using System.Security.Claims;
using FluentAssertions;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using LeaveManagement.Infrastructure.Services;
using LeaveManagement.Infrastructure.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using Xunit;

namespace LeaveManagement.Infrastructure.Tests.Services;

public class CurrentUserServiceTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly CurrentUserService _sut;

    public CurrentUserServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        _sut = new CurrentUserService(_httpContextAccessor, _context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public void GetUserEmail_ShouldReturnEmailClaim()
    {
        var email = "test@example.com";
        var claims = new[] { new Claim(ClaimTypes.Email, email) };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = principal };
        _httpContextAccessor.HttpContext.Returns(httpContext);

        var result = _sut.GetUserEmail();

        result.Should().Be(email);
    }

    [Fact]
    public void GetUserEmail_ShouldReturnPreferredUsername_WhenEmailMissing()
    {
        var username = "user123";
        var claims = new[] { new Claim("preferred_username", username) };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = principal };
        _httpContextAccessor.HttpContext.Returns(httpContext);

        var result = _sut.GetUserEmail();

        result.Should().Be(username);
    }

    [Fact]
    public void GetCurrentUserId_ShouldReturnObjectIdentifier()
    {
        var adId = "oid-123";
        var claims = new[]
        {
            new Claim("http://schemas.microsoft.com/identity/claims/objectidentifier", adId),
        };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = principal };
        _httpContextAccessor.HttpContext.Returns(httpContext);

        var result = _sut.GetCurrentUserId();

        result.Should().Be(adId);
    }

    [Fact]
    public async Task GetCurrentEmployeeIdAsync_ShouldReturnId_WhenUserIdMatches()
    {
        var userId = Guid.NewGuid();
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            User = new User
            {
                Id = userId,
                Email = "test@emp.com",
                FullName = "Emp",
            },
        };
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(claims)),
        };
        _httpContextAccessor.HttpContext.Returns(httpContext);

        var result = await _sut.GetCurrentEmployeeIdAsync();

        result.Should().Be(employee.Id);
    }

    [Fact]
    public async Task GetCurrentEmployeeIdAsync_ShouldReturnId_WhenExternalIdMatches()
    {
        var adId = "ad-123";
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            User = new User
            {
                Id = Guid.NewGuid(),
                Email = "a@b.com",
                ExternalId = adId,
                FullName = "Emp",
            },
        };
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        var claims = new[]
        {
            new Claim("http://schemas.microsoft.com/identity/claims/objectidentifier", adId),
        };
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(claims)),
        };
        _httpContextAccessor.HttpContext.Returns(httpContext);

        var result = await _sut.GetCurrentEmployeeIdAsync();

        result.Should().Be(employee.Id);
    }

    [Fact]
    public async Task GetCurrentEmployeeIdAsync_ShouldReturnEmpty_WhenNoUser()
    {
        _httpContextAccessor.HttpContext.Returns((HttpContext)null!);

        var result = await _sut.GetCurrentEmployeeIdAsync();

        result.Should().BeEmpty();
    }

    [Fact]
    public void GetUserEmail_ShouldReturnEmpty_WhenContextNull()
    {
        _httpContextAccessor.HttpContext.Returns((HttpContext)null!);
        _sut.GetUserEmail().Should().BeEmpty();
    }

    [Fact]
    public void GetUserEmail_ShouldReturnEmpty_WhenUserNull()
    {
        _httpContextAccessor.HttpContext.Returns(new DefaultHttpContext { User = null! });
        _sut.GetUserEmail().Should().BeEmpty();
    }

    [Fact]
    public void GetCurrentUserId_ShouldReturnEmpty_WhenContextNull()
    {
        _httpContextAccessor.HttpContext.Returns((HttpContext)null!);
        _sut.GetCurrentUserId().Should().BeEmpty();
    }

    [Fact]
    public void GetCurrentUserId_ShouldReturnNameIdentifier_WhenOidMissing()
    {
        var id = "sub-123";
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, id) };
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(claims)),
        };
        _httpContextAccessor.HttpContext.Returns(httpContext);

        var result = _sut.GetCurrentUserId();

        result.Should().Be(id);
    }

    [Fact]
    public async Task GetCurrentEmployeeIdAsync_ShouldReturnFirstMatch_WhenMultipleEmployeesMatchUserId()
    {
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "shared@e.com",
            FullName = "Shared",
        };
        _context.Users.Add(user);

        var emp1 = new Employee { Id = Guid.NewGuid(), UserId = userId };
        var emp2 = new Employee { Id = Guid.NewGuid(), UserId = userId };
        _context.Employees.AddRange(emp1, emp2);
        await _context.SaveChangesAsync();

        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        _httpContextAccessor.HttpContext.Returns(
            new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims)) }
        );

        var result = await _sut.GetCurrentEmployeeIdAsync();

        // Should return one of them
        new[] { emp1.Id, emp2.Id }
            .Should()
            .Contain(result);
    }

    [Fact]
    public async Task GetCurrentEmployeeIdAsync_ShouldReturnEmpty_WhenUserExistsButNoEmployeeMatch()
    {
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "u@e.com",
            FullName = "U",
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        _httpContextAccessor.HttpContext.Returns(
            new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims)) }
        );

        var result = await _sut.GetCurrentEmployeeIdAsync();

        result.Should().Be(Guid.Empty);
    }

    [Fact]
    public async Task GetCurrentEmployeeIdAsync_ShouldFallbackToExternalId_WhenNameIdentifierIsNotGuid()
    {
        var externalId = "ext-123";
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            User = new User
            {
                Id = Guid.NewGuid(),
                ExternalId = externalId,
                Email = "ext@e.com",
                FullName = "Ext",
            },
        };
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, externalId) };
        _httpContextAccessor.HttpContext.Returns(
            new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims)) }
        );

        var result = await _sut.GetCurrentEmployeeIdAsync();

        result.Should().Be(employee.Id);
    }
}
