using System;
using LeaveManagement.Domain.Interfaces;

namespace LeaveManagement.Application.Services;

public class MockCurrentUserService : ICurrentUserService
{
    public Guid GetCurrentEmployeeId() => Guid.Parse("e1111111-1111-1111-1111-111111111111");
    public string GetCurrentUserId() => "mock-user-id";
    public string GetUserEmail() => "mock.user@example.com";
}
