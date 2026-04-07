using System;

namespace LeaveManagement.Domain.Interfaces;

public interface ICurrentUserService
{
    Guid GetCurrentEmployeeId();
    string GetUserEmail();
    string GetCurrentUserId();
}
