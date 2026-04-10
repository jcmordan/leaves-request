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
            ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("preferred_username")
            ?? string.Empty;
    }

    public async Task<Guid> GetCurrentEmployeeIdAsync()
    {
        var email = GetUserEmail();
        if (string.IsNullOrEmpty(email))
        {
            return Guid.Empty;
        }

        var employee = await _context
            .Employees.AsNoTracking()
            .FirstOrDefaultAsync(e => e.User != null && e.User.Email == email);

        if (employee == null)
        {
            var adId = GetCurrentUserId();

            if (!string.IsNullOrEmpty(adId))
            {
                employee = await _context
                    .Employees.AsNoTracking()
                    .FirstOrDefaultAsync(e => e.User != null && e.User.ExternalId == adId);
            }
        }

        return employee?.Id ?? Guid.Empty;
    }

    public string GetCurrentUserId()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirstValue(
                "http://schemas.microsoft.com/identity/claims/objectidentifier"
            )
            ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? string.Empty;
    }
}
