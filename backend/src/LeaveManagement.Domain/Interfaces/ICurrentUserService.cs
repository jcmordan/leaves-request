using System;

namespace LeaveManagement.Domain.Interfaces;

public interface ICurrentUserService
{
    Task<Guid> GetCurrentEmployeeIdAsync();
    string GetUserEmail();
    string GetCurrentUserId();
}
