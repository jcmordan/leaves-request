using LeaveManagement.Domain.Common;
using LeaveManagement.Infrastructure.Models;

namespace LeaveManagement.Infrastructure.Interfaces;

public interface IAuthService
{
    Task<Result<AuthResponse>> LoginAsync(string email, string password);
}
