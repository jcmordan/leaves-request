using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;

namespace LeaveManagement.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly LeaveManagementDbContext _context;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor, LeaveManagementDbContext context)
    {
        _httpContextAccessor = httpContextAccessor;
        _context = context;
    }

    public string GetUserEmail()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email) 
               ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("preferred_username") 
               ?? string.Empty;
    }

    public Guid GetCurrentEmployeeId()
    {
        var email = GetUserEmail();
        if (string.IsNullOrEmpty(email))
        {
            return Guid.Empty;
        }

        var employee = _context.Employees
            .AsNoTracking()
            .FirstOrDefault(e => e.User != null && e.User.Email == email);

        if (employee == null)
        {
            var adId = GetCurrentUserId();
            
            if (!string.IsNullOrEmpty(adId))
            {
                employee = _context.Employees
                    .AsNoTracking()
                    .FirstOrDefault(e => e.User != null && e.User.ActiveDirectoryObjectId == adId);
            }
        }

        return employee?.Id ?? Guid.Empty;
    }

    public string GetCurrentUserId()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier") 
               ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) 
               ?? string.Empty;
    }
}
