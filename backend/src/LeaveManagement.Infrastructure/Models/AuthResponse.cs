using System.Collections.Generic;

namespace LeaveManagement.Infrastructure.Models;

public record AuthResponse(string Token, string Email, string FullName, IEnumerable<string> Roles);

public record LoginRequest(string Email, string Password);
