using System;
using Microsoft.EntityFrameworkCore;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;

namespace LeaveManagement.Infrastructure.Data.Seeders;

public static class AbsenceTypeSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AbsenceType>().HasData(
            new AbsenceType 
            { 
                Id = Guid.Parse("a1111111-1111-1111-1111-111111111111"), 
                Name = "Vacaciones", 
                Description = "Vacaciones anuales reglamentarias", 
                CalculationType = CalculationType.WorkingDays, 
                MaxDaysPerYear = 14, 
                DeductsFromBalance = true 
            },
            new AbsenceType 
            { 
                Id = Guid.Parse("a2222222-2222-2222-2222-222222222222"), 
                Name = "Licencia Médica", 
                Description = "Licencia por enfermedad con certificado médico", 
                CalculationType = CalculationType.CalendarDays, 
                MaxDaysPerYear = 30, 
                DeductsFromBalance = false, 
                RequiresAttachment = true, 
                RequiresDoctor = true 
            },
            new AbsenceType 
            { 
                Id = Guid.Parse("a3333333-3333-3333-3333-333333333333"), 
                Name = "Matrimonio", 
                Description = "Licencia por matrimonio (7 días consecutivos)", 
                CalculationType = CalculationType.CalendarDays, 
                MaxDaysPerYear = 7, 
                DeductsFromBalance = false 
            },
            new AbsenceType 
            { 
                Id = Guid.Parse("a4444444-4444-4444-4444-444444444444"), 
                Name = "Fallecimiento Pariente", 
                Description = "Licencia por fallecimiento de pariente directo (3 días laborables)", 
                CalculationType = CalculationType.WorkingDays, 
                MaxDaysPerYear = 3, 
                DeductsFromBalance = false 
            },
            new AbsenceType 
            { 
                Id = Guid.Parse("a5555555-5555-5555-5555-555555555555"), 
                Name = "Nacimiento", 
                Description = "Licencia por nacimiento (10 días laborables)", 
                CalculationType = CalculationType.WorkingDays, 
                MaxDaysPerYear = 10, 
                DeductsFromBalance = false 
            },
            new AbsenceType 
            { 
                Id = Guid.Parse("a6666666-6666-6666-6666-666666666666"), 
                Name = "Cambio de Residencia", 
                Description = "Licencia por cambio de residencia (1 día laborable)", 
                CalculationType = CalculationType.WorkingDays, 
                MaxDaysPerYear = 1, 
                DeductsFromBalance = false 
            }
        );
    }
}
