using System;
using Microsoft.EntityFrameworkCore;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Seeders;

public static class DepartmentSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Department>().HasData(
            new Department { Id = Guid.Parse("d1111111-1111-1111-1111-111111111111"), Name = "Recursos Humanos", Code = "RH" },
            new Department { Id = Guid.Parse("d2222222-2222-2222-2222-222222222222"), Name = "Tecnología de la Información", Code = "IT" },
            new Department { Id = Guid.Parse("d3333333-3333-3333-3333-333333333333"), Name = "Finanzas", Code = "FIN" },
            new Department { Id = Guid.Parse("d4444444-4444-4444-4444-444444444444"), Name = "Operaciones", Code = "OPS" },
            new Department { Id = Guid.Parse("d5555555-5555-5555-5555-555555555555"), Name = "Ventas", Code = "SLS" },
            new Department { Id = Guid.Parse("d6666666-6666-6666-6666-666666666666"), Name = "Legal", Code = "LGL" }
        );
    }
}
