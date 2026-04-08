using LeaveManagement.Domain.Common;
using LeaveManagement.Infrastructure.Interfaces;
using LeaveManagement.Infrastructure.Models;

namespace LeaveManagement.Api.GraphQL.Mutations;

[ExtendObjectType(typeof(Mutation))]
public class AuthMutations
{
    public async Task<LoginPayload> Login(LoginRequest input, [Service] IAuthService authService)
    {
        var result = await authService.LoginAsync(input.Email, input.Password);

        if (result.IsFailure)
        {
            return new LoginPayload(false, null, result.Error);
        }

        return new LoginPayload(true, result.Value, null);
    }
}

public record LoginPayload(
    bool Success,
    AuthResponse? Data,
    LeaveManagement.Domain.Common.Error? Error
);
