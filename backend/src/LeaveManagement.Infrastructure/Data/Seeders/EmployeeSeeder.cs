using System;
using Microsoft.EntityFrameworkCore;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Seeders;

public static class EmployeeSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        var employeeId = Guid.Parse("e1111111-1111-1111-1111-111111111111");
        var departmentId = Guid.Parse("d2222222-2222-2222-2222-222222222222"); // IT

        modelBuilder.Entity<Employee>().HasData(
            new Employee
            {
                Id = employeeId,
                FirstName = "Juan",
                LastName = "Pérez",
                Email = "juan.perez@example.do",
                EmployeeCode = "EMP001",
                NationalId = "001-0000000-1",
                DepartmentId = departmentId,
                IsActive = true,
                Role = "Admin",
                HireDate = new DateTime(2023, 11, 15, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        modelBuilder.Entity<VacationBalance>().HasData(
            new VacationBalance
            {
                Id = Guid.Parse("b1111111-1111-1111-1111-111111111111"),
                EmployeeId = employeeId,
                Year = 2026,
                TotalDays = 14,
                UsedDays = 0,
                CarriedOverDays = 0,
                ExpiresAt = new DateTime(2027, 3, 31, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
