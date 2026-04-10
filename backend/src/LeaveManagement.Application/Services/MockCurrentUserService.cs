using System;
using LeaveManagement.Domain.Interfaces;

namespace LeaveManagement.Application.Services;

public class MockCurrentUserService : ICurrentUserService
{
    public Guid MockEmployeeId { get; set; } = Guid.Parse("e1111111-1111-1111-1111-111111111111");
    public string MockUserId { get; set; } = "mock-user-id";
    public string MockUserEmail { get; set; } = "mock.user@example.com";

    public Task<Guid> GetCurrentEmployeeIdAsync() => Task.FromResult(MockEmployeeId);
    public string GetCurrentUserId() => MockUserId;
    public string GetUserEmail() => MockUserEmail;
}
