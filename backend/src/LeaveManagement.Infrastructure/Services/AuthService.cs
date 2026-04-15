using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LeaveManagement.Domain.Common;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;
using LeaveManagement.Infrastructure.Interfaces;
using LeaveManagement.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace LeaveManagement.Infrastructure.Services;

public class AuthService(
    LeaveManagementDbContext context,
    IConfiguration configuration,
    IPasswordHasher passwordHasher
    ) : IAuthService
{
    private readonly LeaveManagementDbContext _context = context;
    private readonly IConfiguration _configuration = configuration;
    private readonly IPasswordHasher _passwordHasher = passwordHasher;

    public async Task<Result<AuthResponse>> LoginAsync(string email, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null || string.IsNullOrEmpty(user.PasswordHash))
        {
            return Result<AuthResponse>.Failure(
                new Error("Auth.InvalidCredentials", "The provided credentials are incorrect.")
            );
        }

        if (!_passwordHasher.VerifyPassword(password, user.PasswordHash))
        {
            return Result<AuthResponse>.Failure(
                new Error("Auth.InvalidCredentials", "The provided credentials are incorrect.")
            );
        }

        var token = GenerateJwtToken(user);

        var roles = GetRolesAsString(user.Roles);
        return Result<AuthResponse>.Success(
            new AuthResponse(token, user.Email, user.FullName, roles)
        );
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("FullName", user.FullName),
        };

        foreach (var role in GetRolesAsString(user.Roles))
        {
            claims.Add(new(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(double.Parse(jwtSettings["ExpireHours"] ?? "24")),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static IEnumerable<string> GetRolesAsString(IEnumerable<UserRole> roles)
    {
        return roles.Select(r => r.ToString());
    }
}
