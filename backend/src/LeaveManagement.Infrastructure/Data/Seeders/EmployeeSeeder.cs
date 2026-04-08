using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Data.Seeders;

public static class EmployeeSeeder
{
    public sealed class EmployeeRecord
    {
        public string Ficha { get; set; } = string.Empty;
        public string AN8 { get; set; } = string.Empty;
        public string FechaIngreso { get; set; } = string.Empty;
        public string Cedula { get; set; } = string.Empty;
        public string NombreEmpleado { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Genero { get; set; } = string.Empty;
        public string FichaSupervisor { get; set; } = string.Empty;
    }

    public static async Task SeedAsync(LeaveManagementDbContext context, string csvPath)
    {
        Console.WriteLine($"[EmployeeSeeder] Starting seeding from: {csvPath}");

        if (!File.Exists(csvPath))
        {
            Console.WriteLine($"[EmployeeSeeder] Error: CSV file not found at {csvPath}");
            return;
        }

        try
        {
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                Delimiter = ";",
                HasHeaderRecord = true,
                MissingFieldFound = null,
                HeaderValidated = null,
            };

            using var reader = new StreamReader(csvPath);
            using var csv = new CsvReader(reader, config);
            var records = csv.GetRecords<EmployeeRecord>().ToList();

            Console.WriteLine($"[EmployeeSeeder] Found {records.Count} records in CSV.");

            var departmentId = Guid.Parse("d2222222-2222-2222-2222-222222222222"); // IT Department
            var fichaToIdMap = new Dictionary<string, Guid>();

            var employees = new List<Employee>();
            var balances = new List<VacationBalance>();

            // Get existing employee codes to avoid duplicates
            var existingCodes = await context.Employees.Select(e => e.EmployeeCode).ToListAsync();
            var existingNationalIds = await context.Employees.Select(e => e.NationalId).ToListAsync();

            Console.WriteLine($"[EmployeeSeeder] Found {existingCodes.Count} existing employees in database.");

            // First pass: Create Employees (without managers yet)
            foreach (var record in records)
            {
                var cleanFicha = record.Ficha.Trim();
                if (
                    existingCodes.Contains(cleanFicha)
                    || employees.Any(e => e.EmployeeCode == cleanFicha)
                )
                {
                    continue;
                }

                var cleanCedula = record.Cedula.Trim();
                if (
                    existingNationalIds.Contains(cleanCedula)
                    || employees.Any(e => e.NationalId == cleanCedula)
                )
                {
                    continue;
                }

                var employeeId = Guid.CreateVersion7();
                fichaToIdMap[cleanFicha] = employeeId;

                // Split name into first and last
                var nameParts = record
                    .NombreEmpleado.Trim()
                    .Split(' ', StringSplitOptions.RemoveEmptyEntries);
                var firstName = nameParts.Length > 0 ? nameParts[0] : "";
                var lastName = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "";

                // Parse date
                DateTime hireDate;
                if (
                    !DateTime.TryParseExact(
                        record.FechaIngreso,
                        new[] { "d-MMM-yy", "dd-MMM-yy", "d/M/yyyy", "dd/MM/yyyy" },
                        CultureInfo.InvariantCulture,
                        DateTimeStyles.None,
                        out hireDate
                    )
                )
                {
                    hireDate = DateTime.UtcNow;
                }

                var employee = new Employee
                {
                    Id = employeeId,
                    FirstName = firstName,
                    LastName = lastName,
                    Email = record.Email.Trim(),
                    EmployeeCode = cleanFicha,
                    AN8 = record.AN8.Trim(),
                    NationalId = record.Cedula.Trim(),
                    DepartmentId = departmentId,
                    HireDate = DateTime.SpecifyKind(hireDate, DateTimeKind.Utc),
                    IsActive = true,
                };
                employees.Add(employee);

                // Create vacation balance
                var balance = new VacationBalance
                {
                    Id = Guid.CreateVersion7(),
                    EmployeeId = employeeId,
                    Year = 2026,
                    TotalDays = 14,
                    UsedDays = 0,
                    CarriedOverDays = 0,
                    ExpiresAt = new DateTime(2027, 3, 31, 0, 0, 0, DateTimeKind.Utc),
                };
                balances.Add(balance);
            }

            Console.WriteLine($"[EmployeeSeeder] Processing {employees.Count} new employees to add.");

            // Second pass: Assign managers (look in map first, then in DB if needed)
            foreach (var employee in employees)
            {
                var record = records.First(r => r.Ficha == employee.EmployeeCode);
                if (string.IsNullOrWhiteSpace(record.FichaSupervisor))
                    continue;

                var cleanSupervisorFicha = record.FichaSupervisor.Trim();
                if (fichaToIdMap.TryGetValue(cleanSupervisorFicha, out var managerId))
                {
                    employee.ManagerId = managerId;
                }
                else
                {
                    // Optionally look up existing employee in DB
                    var existingManager = await context.Employees.FirstOrDefaultAsync(e =>
                        e.EmployeeCode == cleanSupervisorFicha
                    );
                    if (existingManager != null)
                    {
                        employee.ManagerId = existingManager.Id;
                    }
                }
            }

            // Save everything
            if (employees.Count > 0)
            {
                await context.Employees.AddRangeAsync(employees);
                await context.VacationBalances.AddRangeAsync(balances);
                await context.SaveChangesAsync();
                Console.WriteLine($"[EmployeeSeeder] Successfully seeded {employees.Count} employees.");
            }
            else
            {
                Console.WriteLine("[EmployeeSeeder] No new employees to seed.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmployeeSeeder] Critical error during seeding: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
        }
    }
}
