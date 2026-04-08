using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;
using LeaveManagement.Domain.Interfaces;

namespace LeaveManagement.Infrastructure.Services;

/// <summary>
/// Implementation of IPasswordHasher using the Argon2id algorithm.
/// Follows OWASP recommendations for iterations, memory, and parallelism.
/// </summary>
public class Argon2PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 3;
    private const int MemorySize = 65536; // 64 MB
    private const int Parallelism = 4;

    /// <inheritdoc />
    public string HashPassword(string password)
    {
        var salt = GenerateSalt();
        return HashPassword(password, salt);
    }

    /// <summary>
    /// Hashes a password using a provided salt. Useful for deterministic hashing (e.g. database seeding).
    /// </summary>
    /// <param name="password">The password to hash.</param>
    /// <param name="salt">The salt to use.</param>
    /// <returns>The encoded hash string.</returns>
    public string HashPassword(string password, byte[] salt)
    {
        var hash = ComputeHash(password, salt);
        return EncodeHash(salt, hash);
    }

    /// <inheritdoc />
    public bool VerifyPassword(string password, string hashedPassword)
    {
        if (password == null)
        {
            return false;
        }

        if (
            !DecodeHash(
                hashedPassword,
                out var salt,
                out var storedHash,
                out var iterations,
                out var memorySize,
                out var parallelism
            )
        )
        {
            return false;
        }

        var computedHash = ComputeHash(password, salt, iterations, memorySize, parallelism);

        return CryptographicOperations.FixedTimeEquals(storedHash, computedHash);
    }

    private static byte[] GenerateSalt()
    {
        var salt = new byte[SaltSize];
        RandomNumberGenerator.Fill(salt);

        return salt;
    }

    private static byte[] ComputeHash(
        string password,
        byte[] salt,
        int iterations = Iterations,
        int memorySize = MemorySize,
        int parallelism = Parallelism
    )
    {
        using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password));
        argon2.Salt = salt;
        argon2.DegreeOfParallelism = parallelism;
        argon2.Iterations = iterations;
        argon2.MemorySize = memorySize;

        return argon2.GetBytes(HashSize);
    }

    private static string EncodeHash(byte[] salt, byte[] hash)
    {
        var saltBase64 = Convert.ToBase64String(salt);
        var hashBase64 = Convert.ToBase64String(hash);

        // Format: $argon2id$v=19$m=<memory>,t=<iterations>,p=<parallelism>$<salt>$<hash>
        return $"$argon2id$v=19$m={MemorySize},t={Iterations},p={Parallelism}${saltBase64}${hashBase64}";
    }

    private static bool DecodeHash(
        string hashedPassword,
        out byte[] salt,
        out byte[] hash,
        out int iterations,
        out int memorySize,
        out int parallelism
    )
    {
        salt = Array.Empty<byte>();
        hash = Array.Empty<byte>();
        iterations = 0;
        memorySize = 0;
        parallelism = 0;

        if (string.IsNullOrEmpty(hashedPassword) || !hashedPassword.StartsWith("$argon2id$"))
        {
            return false;
        }

        var parts = hashedPassword.Split('$');

        if (parts.Length != 6)
        {
            return false;
        }

        try
        {
            // parts[2] is v=19 (ignored for now as we only support one version)
            // parts[3] is m=65536,t=3,p=4
            var configParts = parts[3].Split(',');
            foreach (var config in configParts)
            {
                var kv = config.Split('=');
                if (kv.Length != 2)
                    continue;

                switch (kv[0])
                {
                    case "m":
                        memorySize = int.Parse(kv[1]);
                        break;
                    case "t":
                        iterations = int.Parse(kv[1]);
                        break;
                    case "p":
                        parallelism = int.Parse(kv[1]);
                        break;
                }
            }

            salt = Convert.FromBase64String(parts[4]);
            hash = Convert.FromBase64String(parts[5]);

            return iterations > 0 && memorySize > 0 && parallelism > 0;
        }
        catch
        {
            return false;
        }
    }
}
