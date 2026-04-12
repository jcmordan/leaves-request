using System.Security.Claims;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace LeaveManagement.Infrastructure.Services;

public class CustomClaimsTransformation : IClaimsTransformation
{
    private readonly IServiceProvider _serviceProvider;

    public CustomClaimsTransformation(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not { IsAuthenticated: true })
        {
            return principal;
        }

        // Get oid from token (Microsoft Entra ID specific)
        var oid = principal.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value 
                  ?? principal.FindFirst("oid")?.Value;

        if (string.IsNullOrEmpty(oid))
        {
            return principal;
        }

        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LeaveManagementDbContext>();

        // Check if user exists in local database
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.ExternalId == oid);

        if (user == null)
        {
            // Just-in-Time (JIT) provisioning
            var email = principal.FindFirst(ClaimTypes.Email)?.Value 
                        ?? principal.FindFirst("preferred_username")?.Value;
            
            var fullName = principal.FindFirst(ClaimTypes.Name)?.Value 
                           ?? principal.FindFirst("name")?.Value;

            user = new User
            {
                Id = Guid.NewGuid(),
                ExternalId = oid,
                Email = email ?? string.Empty,
                FullName = fullName ?? "New User",
                Role = UserRole.Employee, // Default local role
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();
        }

        // Inject local Identity and Role from local database into the principal
        var identity = (ClaimsIdentity)principal.Identity;
        
        // Add local user ID as NameIdentifier
        var localUserId = user.Id.ToString();
        if (!identity.HasClaim(c => c.Type == ClaimTypes.NameIdentifier && c.Value == localUserId))
        {
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, localUserId));
        }

        // Add role if not already present
        var roleName = user.Role.ToString();
        if (!identity.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == roleName))
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, roleName));
        }

        return principal;
    }
}
