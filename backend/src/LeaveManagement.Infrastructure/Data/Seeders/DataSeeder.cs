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
        // 1. Seed Absence Types
        var vacationType = await context.AbsenceTypes.FirstOrDefaultAsync(t => t.Name == "Vacation");
        if (vacationType == null)
        {
            vacationType = new AbsenceType
            {
                Id = Guid.NewGuid(),
                Name = "Vacation",
                Description = "Annual vacation leave",
                CalculationType = Domain.Enums.CalculationType.WorkingDays,
                DeductsFromBalance = true,
                IsActive = true
            };
            await context.AbsenceTypes.AddAsync(vacationType);
        }

        var personalType = await context.AbsenceTypes.FirstOrDefaultAsync(t => t.Name == "Personal Days");
        if (personalType == null)
        {
            personalType = new AbsenceType
            {
                Id = Guid.NewGuid(),
                Name = "Personal Days",
                Description = "Personal time off",
                CalculationType = Domain.Enums.CalculationType.WorkingDays,
                DeductsFromBalance = true,
                IsActive = true
            };
            await context.AbsenceTypes.AddAsync(personalType);
        }

        await context.SaveChangesAsync();

        // 2. Seed Entitlement Policies
        if (!await context.EntitlementPolicies.AnyAsync())
        {
            var policies = new List<EntitlementPolicy>
            {
                // Vacation Policies
                new EntitlementPolicy
                {
                    Id = Guid.NewGuid(),
                    AbsenceTypeId = vacationType.Id,
                    MinTenureYears = 0,
                    EntitlementDays = 14,
                    Description = "Standard base vacation (0-5 years)"
                },
                new EntitlementPolicy
                {
                    Id = Guid.NewGuid(),
                    AbsenceTypeId = vacationType.Id,
                    MinTenureYears = 5,
                    EntitlementDays = 22,
                    Description = "Senior vacation (5+ years)"
                },
                // Personal Days Policies
                new EntitlementPolicy
                {
                    Id = Guid.NewGuid(),
                    AbsenceTypeId = personalType.Id,
                    MinTenureYears = 0,
                    EntitlementDays = 3,
                    Description = "Standard personal days"
                }
            };

            await context.EntitlementPolicies.AddRangeAsync(policies);
            await context.SaveChangesAsync();
        }
    }
}
