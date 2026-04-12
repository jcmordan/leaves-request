using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Services;

public class CurrentUserService(
    IHttpContextAccessor httpContextAccessor,
    LeaveManagementDbContext context
) : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly LeaveManagementDbContext _context = context;

    public string GetUserEmail()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email)
            ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(JwtRegisteredClaimNames.Email)
            ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("preferred_username")
            ?? string.Empty;
    }

    public async Task<Guid> GetCurrentEmployeeIdAsync()
    {
        var identityId = GetCurrentUserId();
        if (string.IsNullOrEmpty(identityId))
        {
            return Guid.Empty;
        }

        // 1. Try mapping by local User.Id (Guid) first
        if (Guid.TryParse(identityId, out var userId))
        {
            var employee = await _context
                .Employees.AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employee != null)
            {
                return employee.Id;
            }
        }

        // 2. Fallback: Try mapping by User.ExternalId (string) e.g., EntraID OID
        var employeeByExternal = await _context
            .Employees.AsNoTracking()
            .FirstOrDefaultAsync(e => e.User != null && e.User.ExternalId == identityId);

        return employeeByExternal?.Id ?? Guid.Empty;
    }

    public string GetCurrentUserId()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(
                "http://schemas.microsoft.com/identity/claims/objectidentifier"
            )
            ?? string.Empty;
    }
}
