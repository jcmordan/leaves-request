using System;
using LeaveManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Data.Seeders;

public static class PublicHolidaySeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<PublicHoliday>()
            .HasData(
                new PublicHoliday { Id = Guid.Parse("019d695a-f45b-7f2f-bdf4-84ea708ef9ab"), Date = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), Name = "Año Nuevo", Description = "Año Nuevo", CountryCode = "DO" },
                new PublicHoliday { Id = Guid.Parse("019d695a-f45b-765f-968c-3812fafe6cd7"), Date = new DateTime(2026, 1, 6, 0, 0, 0, DateTimeKind.Utc), Name = "Día de Reyes", Description = "Día de Reyes", CountryCode = "DO" },
                new PublicHoliday { Id = Guid.Parse("019d695a-f45b-75e6-8137-4775223b3f11"), Date = new DateTime(2026, 1, 21, 0, 0, 0, DateTimeKind.Utc), Name = "Día de la Altagracia", Description = "Día de la Altagracia", CountryCode = "DO" },
                new PublicHoliday { Id = Guid.Parse("019d695a-f45b-7db2-a2f9-f8272fc4bb14"), Date = new DateTime(2026, 1, 26, 0, 0, 0, DateTimeKind.Utc), Name = "Día de Duarte", Description = "Día de Duarte", CountryCode = "DO" },
                new PublicHoliday { Id = Guid.Parse("019d695a-f45b-761f-b133-6d9b3e7bd5a0"), Date = new DateTime(2026, 2, 27, 0, 0, 0, DateTimeKind.Utc), Name = "Independencia Nacional", Description = "Independencia Nacional", CountryCode = "DO" },
                new PublicHoliday { Id = Guid.Parse("019d695a-f45b-7719-abc1-0fe250e0aebc"), Date = new DateTime(2026, 4, 3, 0, 0, 0, DateTimeKind.Utc), Name = "Viernes Santo", Description = "Viernes Santo", CountryCode = "DO" },
                new PublicHoliday { Id = Guid.Parse("019d695a-f45b-74d4-9a30-20f6fd4d1274"), Date = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc), Name = "Día del Trabajo", Description = "Día del Trabajo", CountryCode = "DO" },
                new PublicHoliday { Id = Guid.Parse("019d695a-f45b-7c16-9009-52cfb8b7720a"), Date = new DateTime(2026, 6, 4, 0, 0, 0, DateTimeKind.Utc), Name = "Corpus Christi", Description = "Corpus Christi", CountryCode = "DO" },
                new PublicHoliday { Id = Guid.Parse("019d695a-f45b-7144-b2ca-eb93d84cbf5f"), Date = new DateTime(2026, 8, 16, 0, 0, 0, DateTimeKind.Utc), Name = "Día de la Restauración", Description = "Día de la Restauración", CountryCode = "DO" },
                new PublicHoliday { Id = Guid.Parse("019d695a-f45b-7084-88bc-07ef92442906"), Date = new DateTime(2026, 9, 24, 0, 0, 0, DateTimeKind.Utc), Name = "Día de las Mercedes", Description = "Día de las Mercedes", CountryCode = "DO" },
                new PublicHoliday { Id = Guid.Parse("019d695a-f45b-7399-9b3d-2ba57d0d54e6"), Date = new DateTime(2026, 11, 6, 0, 0, 0, DateTimeKind.Utc), Name = "Día de la Constitución", Description = "Día de la Constitución", CountryCode = "DO" },
                new PublicHoliday { Id = Guid.Parse("019d695a-f45b-7361-a348-a3633406757e"), Date = new DateTime(2026, 12, 25, 0, 0, 0, DateTimeKind.Utc), Name = "Día de Navidad", Description = "Día de Navidad", CountryCode = "DO" }
            );
    }
}
