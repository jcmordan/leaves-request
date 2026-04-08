using System.Text;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Data.Seeders;

public static class UserSeeder
{
    public static async Task SeedAsync(
        LeaveManagementDbContext context,
        string? adminPassword,
        IPasswordHasher passwordHasher
    )
    {
        var password =
            adminPassword ?? throw new InvalidOperationException("Admin password is not set.");
        var adminId = Guid.Parse("01950c4c-7000-0000-0000-000000000001");
        var adminEmail = "hradmin@refidomsa.com.do";

        var adminUser = await context.Users.FirstOrDefaultAsync(u =>
            u.Id == adminId || u.Email == adminEmail
        );

        if (adminUser == null)
        {
            var hash = passwordHasher.HashPassword(password);
            adminUser = new User
            {
                Id = adminId,
                Email = adminEmail,
                FullName = "Admin User",
                Role = UserRole.Admin,
                IsActive = true,
                PasswordHash = hash,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();
            Console.WriteLine("[UserSeeder] Admin user created successfully.");
        }
        else
        {
            // Verify if password hash needs update (sync with .env)
            if (
                !string.IsNullOrEmpty(password)
                && (
                    adminUser.PasswordHash == null
                    || !passwordHasher.VerifyPassword(password, adminUser.PasswordHash)
                )
            )
            {
                adminUser.PasswordHash = passwordHasher.HashPassword(password);
                adminUser.UpdatedAt = DateTime.UtcNow;
                context.Users.Update(adminUser);
                await context.SaveChangesAsync();
                Console.WriteLine("[UserSeeder] Admin user password updated successfully.");
            }
        }
    }
}
