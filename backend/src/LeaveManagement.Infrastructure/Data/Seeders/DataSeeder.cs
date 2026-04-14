using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LeaveManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Data.Seeders;

public static class DataSeeder
{
    public static async Task SeedAsync(LeaveManagementDbContext context)
    {

        // 2. Seed Configurations
        if (!await context.Configurations.AnyAsync(c => c.Key == "AttachmentBasePath"))
        {
            await context.Configurations.AddAsync(new Configuration
            {
                Id = Guid.NewGuid(),
                Key = "AttachmentBasePath",
                Value = "~/temp_uploads",
                Description = "Base path for storing file attachments on disk."
            });
        }

        await context.SaveChangesAsync();

    }
}
