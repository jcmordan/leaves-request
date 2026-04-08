namespace LeaveManagement.Domain.Interfaces;

/// <summary>
/// Defines the methods for password hashing and verification.
/// </summary>
public interface IPasswordHasher
{
    /// <summary>
    /// Hashes the provided plain-text password.
    /// </summary>
    /// <param name="password">The plain-text password to hash.</param>
    /// <returns>A string containing the hash, salt, and algorithm parameters.</returns>
    string HashPassword(string password);

    /// <summary>
    /// Verifies a plain-text password against a hashed one.
    /// </summary>
    /// <param name="password">The plain-text password to verify.</param>
    /// <param name="hashedPassword">The hashed password to check against.</param>
    /// <returns>True if the password matches the hash, false otherwise.</returns>
    bool VerifyPassword(string password, string hashedPassword);
}
