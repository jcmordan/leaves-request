namespace LeaveManagement.Infrastructure.Models;

public record AuthResponse(string Token, string Email, string FullName, string Role);

public record LoginRequest(string Email, string Password);
