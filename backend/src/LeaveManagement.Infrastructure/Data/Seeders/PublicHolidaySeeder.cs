using System;
using Microsoft.EntityFrameworkCore;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Seeders;

public static class PublicHolidaySeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PublicHoliday>().HasData(
            // 2026 Holidays (UTC DateTimes) - defaulting to DO (Dominican Republic)
            new PublicHoliday { Id = Guid.Parse("f0000000-0000-0000-0000-000000000001"), Date = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), Name = "Año Nuevo", Description = "Año Nuevo", CountryCode = "DO" },
            new PublicHoliday { Id = Guid.Parse("f0000000-0000-0000-0000-000000000002"), Date = new DateTime(2026, 1, 6, 0, 0, 0, DateTimeKind.Utc), Name = "Día de Reyes", Description = "Día de Reyes", CountryCode = "DO" },
            new PublicHoliday { Id = Guid.Parse("f0000000-0000-0000-0000-000000000003"), Date = new DateTime(2026, 1, 21, 0, 0, 0, DateTimeKind.Utc), Name = "Día de la Altagracia", Description = "Día de la Altagracia", CountryCode = "DO" },
            new PublicHoliday { Id = Guid.Parse("f0000000-0000-0000-0000-000000000004"), Date = new DateTime(2026, 1, 26, 0, 0, 0, DateTimeKind.Utc), Name = "Día de Duarte", Description = "Día de Duarte", CountryCode = "DO" },
            new PublicHoliday { Id = Guid.Parse("f0000000-0000-0000-0000-000000000005"), Date = new DateTime(2026, 2, 27, 0, 0, 0, DateTimeKind.Utc), Name = "Independencia Nacional", Description = "Independencia Nacional", CountryCode = "DO" },
            new PublicHoliday { Id = Guid.Parse("f0000000-0000-0000-0000-000000000006"), Date = new DateTime(2026, 4, 3, 0, 0, 0, DateTimeKind.Utc), Name = "Viernes Santo", Description = "Viernes Santo", CountryCode = "DO" },
            new PublicHoliday { Id = Guid.Parse("f0000000-0000-0000-0000-000000000007"), Date = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc), Name = "Día del Trabajo", Description = "Día del Trabajo", CountryCode = "DO" },
            new PublicHoliday { Id = Guid.Parse("f0000000-0000-0000-0000-000000000008"), Date = new DateTime(2026, 6, 4, 0, 0, 0, DateTimeKind.Utc), Name = "Corpus Christi", Description = "Corpus Christi", CountryCode = "DO" },
            new PublicHoliday { Id = Guid.Parse("f0000000-0000-0000-0000-000000000009"), Date = new DateTime(2026, 8, 16, 0, 0, 0, DateTimeKind.Utc), Name = "Día de la Restauración", Description = "Día de la Restauración", CountryCode = "DO" },
            new PublicHoliday { Id = Guid.Parse("f0000000-0000-0000-0000-00000000000a"), Date = new DateTime(2026, 9, 24, 0, 0, 0, DateTimeKind.Utc), Name = "Día de las Mercedes", Description = "Día de las Mercedes", CountryCode = "DO" },
            new PublicHoliday { Id = Guid.Parse("f0000000-0000-0000-0000-00000000000b"), Date = new DateTime(2026, 11, 6, 0, 0, 0, DateTimeKind.Utc), Name = "Día de la Constitución", Description = "Día de la Constitución", CountryCode = "DO" },
            new PublicHoliday { Id = Guid.Parse("f0000000-0000-0000-0000-00000000000c"), Date = new DateTime(2026, 12, 25, 0, 0, 0, DateTimeKind.Utc), Name = "Día de Navidad", Description = "Día de Navidad", CountryCode = "DO" }
        );
    }
}
