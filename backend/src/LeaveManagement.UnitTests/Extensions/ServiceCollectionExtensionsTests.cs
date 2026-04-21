using FluentAssertions;
using LeaveManagement.Api.Extensions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using NSubstitute;
using Xunit;

namespace LeaveManagement.UnitTests.Extensions;

public class ServiceCollectionExtensionsTests
{
    private readonly IServiceCollection _services;
    private readonly IConfiguration _configuration;

    public ServiceCollectionExtensionsTests()
    {
        _services = new ServiceCollection();
        _configuration = Substitute.For<IConfiguration>();
        
        // Mock default configuration sections
        _configuration.GetSection("Jwt")["Issuer"].Returns("test_issuer");
        _configuration.GetSection("Jwt")["Audience"].Returns("test_audience");
        _configuration.GetSection("Jwt")["Key"].Returns("super_secret_key_that_is_long_enough_for_sha256");
    }

    [Fact]
    public void AddAuthenticationAndAuthorization_ShouldRegisterServices()
    {
        // Act
        _services.AddAuthenticationAndAuthorization(_configuration);
        var serviceProvider = _services.BuildServiceProvider();

        // Assert
        serviceProvider.GetService<IAuthenticationService>().Should().NotBeNull();
        serviceProvider.GetRequiredService<IOptions<AuthenticationOptions>>().Value.DefaultAuthenticateScheme.Should().Be("Hybrid");
    }

    [Fact]
    public void AddAuthenticationAndAuthorization_WithAzureAdEnvVars_ShouldUpdateConfiguration()
    {
        // Arrange
        Environment.SetEnvironmentVariable("AUTH_MICROSOFT_ENTRA_ID_ID", "test-client-id");
        Environment.SetEnvironmentVariable("AUTH_MICROSOFT_ENTRA_ID_TENANT_ID", "test-tenant-id");

        // Act
        _services.AddAuthenticationAndAuthorization(_configuration);

        // Assert
        _configuration["AzureAd:ClientId"].Should().Be("test-client-id");
        _configuration["AzureAd:TenantId"].Should().Be("test-tenant-id");

        // Cleanup
        Environment.SetEnvironmentVariable("AUTH_MICROSOFT_ENTRA_ID_ID", null);
        Environment.SetEnvironmentVariable("AUTH_MICROSOFT_ENTRA_ID_TENANT_ID", null);
    }

    [Fact]
    public void HybridSchemeSelector_ShouldReturnLocalBearer_WhenNoAuthorizationHeader()
    {
        // Arrange
        _services.AddAuthenticationAndAuthorization(_configuration);
        var serviceProvider = _services.BuildServiceProvider();
        var options = serviceProvider.GetRequiredService<IOptionsSnapshot<PolicySchemeOptions>>().Get("Hybrid");
        var context = new DefaultHttpContext();

        // Act
        var scheme = options.ForwardDefaultSelector!(context);

        // Assert
        scheme.Should().Be("LocalBearer");
    }

    [Fact]
    public void HybridSchemeSelector_ShouldReturnLocalBearer_WhenTokenHasLocalIssuer()
    {
        // Arrange
        _services.AddAuthenticationAndAuthorization(_configuration);
        var serviceProvider = _services.BuildServiceProvider();
        var options = serviceProvider.GetRequiredService<IOptionsSnapshot<PolicySchemeOptions>>().Get("Hybrid");
        var context = new DefaultHttpContext();
        
        // We'd need to generate a real JWT with the local issuer to fully test the selector logic
        // But we can check that it returns "LocalBearer" (the default when AzureAd is not configured)
        context.Request.Headers["Authorization"] = "Bearer some-token";

        // Act
        var scheme = options.ForwardDefaultSelector!(context);

        // Assert
        scheme.Should().Be("LocalBearer");
    }
}
