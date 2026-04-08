using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LeaveManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixSeederGuids : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000008"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000009"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-00000000000a"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-00000000000b"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-00000000000c"));

            migrationBuilder.DeleteData(
                table: "VacationBalances",
                keyColumn: "Id",
                keyValue: new Guid("b1111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: new Guid("e1111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1111111-1111-1111-1111-111111111111"));

            migrationBuilder.InsertData(
                table: "PublicHolidays",
                columns: new[] { "Id", "CountryCode", "Date", "Description", "Name" },
                values: new object[,]
                {
                    { new Guid("019d695a-f45b-7084-88bc-07ef92442906"), "DO", new DateTime(2026, 9, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Día de las Mercedes", "Día de las Mercedes" },
                    { new Guid("019d695a-f45b-7144-b2ca-eb93d84cbf5f"), "DO", new DateTime(2026, 8, 16, 0, 0, 0, 0, DateTimeKind.Utc), "Día de la Restauración", "Día de la Restauración" },
                    { new Guid("019d695a-f45b-7361-a348-a3633406757e"), "DO", new DateTime(2026, 12, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Día de Navidad", "Día de Navidad" },
                    { new Guid("019d695a-f45b-7399-9b3d-2ba57d0d54e6"), "DO", new DateTime(2026, 11, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Día de la Constitución", "Día de la Constitución" },
                    { new Guid("019d695a-f45b-74d4-9a30-20f6fd4d1274"), "DO", new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Día del Trabajo", "Día del Trabajo" },
                    { new Guid("019d695a-f45b-75e6-8137-4775223b3f11"), "DO", new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Día de la Altagracia", "Día de la Altagracia" },
                    { new Guid("019d695a-f45b-761f-b133-6d9b3e7bd5a0"), "DO", new DateTime(2026, 2, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Independencia Nacional", "Independencia Nacional" },
                    { new Guid("019d695a-f45b-765f-968c-3812fafe6cd7"), "DO", new DateTime(2026, 1, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Día de Reyes", "Día de Reyes" },
                    { new Guid("019d695a-f45b-7719-abc1-0fe250e0aebc"), "DO", new DateTime(2026, 4, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Viernes Santo", "Viernes Santo" },
                    { new Guid("019d695a-f45b-7c16-9009-52cfb8b7720a"), "DO", new DateTime(2026, 6, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Corpus Christi", "Corpus Christi" },
                    { new Guid("019d695a-f45b-7db2-a2f9-f8272fc4bb14"), "DO", new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), "Día de Duarte", "Día de Duarte" },
                    { new Guid("019d695a-f45b-7f2f-bdf4-84ea708ef9ab"), "DO", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Año Nuevo", "Año Nuevo" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("019d695a-f45b-7084-88bc-07ef92442906"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("019d695a-f45b-7144-b2ca-eb93d84cbf5f"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("019d695a-f45b-7361-a348-a3633406757e"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("019d695a-f45b-7399-9b3d-2ba57d0d54e6"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("019d695a-f45b-74d4-9a30-20f6fd4d1274"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("019d695a-f45b-75e6-8137-4775223b3f11"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("019d695a-f45b-761f-b133-6d9b3e7bd5a0"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("019d695a-f45b-765f-968c-3812fafe6cd7"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("019d695a-f45b-7719-abc1-0fe250e0aebc"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("019d695a-f45b-7c16-9009-52cfb8b7720a"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("019d695a-f45b-7db2-a2f9-f8272fc4bb14"));

            migrationBuilder.DeleteData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("019d695a-f45b-7f2f-bdf4-84ea708ef9ab"));

            migrationBuilder.InsertData(
                table: "PublicHolidays",
                columns: new[] { "Id", "CountryCode", "Date", "Description", "Name" },
                values: new object[,]
                {
                    { new Guid("f0000000-0000-0000-0000-000000000001"), "DO", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Año Nuevo", "Año Nuevo" },
                    { new Guid("f0000000-0000-0000-0000-000000000002"), "DO", new DateTime(2026, 1, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Día de Reyes", "Día de Reyes" },
                    { new Guid("f0000000-0000-0000-0000-000000000003"), "DO", new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Día de la Altagracia", "Día de la Altagracia" },
                    { new Guid("f0000000-0000-0000-0000-000000000004"), "DO", new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), "Día de Duarte", "Día de Duarte" },
                    { new Guid("f0000000-0000-0000-0000-000000000005"), "DO", new DateTime(2026, 2, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Independencia Nacional", "Independencia Nacional" },
                    { new Guid("f0000000-0000-0000-0000-000000000006"), "DO", new DateTime(2026, 4, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Viernes Santo", "Viernes Santo" },
                    { new Guid("f0000000-0000-0000-0000-000000000007"), "DO", new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Día del Trabajo", "Día del Trabajo" },
                    { new Guid("f0000000-0000-0000-0000-000000000008"), "DO", new DateTime(2026, 6, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Corpus Christi", "Corpus Christi" },
                    { new Guid("f0000000-0000-0000-0000-000000000009"), "DO", new DateTime(2026, 8, 16, 0, 0, 0, 0, DateTimeKind.Utc), "Día de la Restauración", "Día de la Restauración" },
                    { new Guid("f0000000-0000-0000-0000-00000000000a"), "DO", new DateTime(2026, 9, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Día de las Mercedes", "Día de las Mercedes" },
                    { new Guid("f0000000-0000-0000-0000-00000000000b"), "DO", new DateTime(2026, 11, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Día de la Constitución", "Día de la Constitución" },
                    { new Guid("f0000000-0000-0000-0000-00000000000c"), "DO", new DateTime(2026, 12, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Día de Navidad", "Día de Navidad" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "ExternalId", "FullName", "IsActive", "PasswordHash", "Role", "UpdatedAt" },
                values: new object[] { new Guid("a1111111-1111-1111-1111-111111111111"), new DateTime(2023, 11, 15, 0, 0, 0, 0, DateTimeKind.Utc), "juan.perez@example.do", null, "Juan Pérez", true, "$2a$11$q5MkhSBq8S7.eB.Y7.eB.Y7.eB.Y7.eB.Y7.eB.Y7.eB.Y7.eB.Y7.eB.Y", "HRManager", null });

            migrationBuilder.InsertData(
                table: "Employees",
                columns: new[] { "Id", "AN8", "DepartmentId", "Email", "EmployeeCode", "FirstName", "HireDate", "IsActive", "LastName", "ManagerId", "NationalId", "Role", "UserId" },
                values: new object[] { new Guid("e1111111-1111-1111-1111-111111111111"), "", new Guid("d2222222-2222-2222-2222-222222222222"), "juan.perez@example.do", "EMP001", "Juan", new DateTime(2023, 11, 15, 0, 0, 0, 0, DateTimeKind.Utc), true, "Pérez", null, "001-0000000-1", "Admin", new Guid("a1111111-1111-1111-1111-111111111111") });

            migrationBuilder.InsertData(
                table: "VacationBalances",
                columns: new[] { "Id", "CarriedOverDays", "EmployeeId", "ExpiresAt", "TotalDays", "UsedDays", "Year" },
                values: new object[] { new Guid("b1111111-1111-1111-1111-111111111111"), 0, new Guid("e1111111-1111-1111-1111-111111111111"), new DateTime(2027, 3, 31, 0, 0, 0, 0, DateTimeKind.Utc), 14, 0, 2026 });
        }
    }
}
