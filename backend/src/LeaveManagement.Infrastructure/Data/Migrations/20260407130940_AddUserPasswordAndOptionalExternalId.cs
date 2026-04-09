using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeaveManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPasswordAndOptionalExternalId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "IX_Users_ActiveDirectoryObjectId", table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_PublicHolidays_Date_Year",
                table: "PublicHolidays"
            );

            migrationBuilder.DropColumn(name: "Year", table: "PublicHolidays");

            migrationBuilder.RenameColumn(
                name: "ActiveDirectoryObjectId",
                table: "Users",
                newName: "Role"
            );

            migrationBuilder.AddColumn<string>(
                name: "ExternalId",
                table: "Users",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Users",
                type: "character varying(1024)",
                maxLength: 1024,
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "CountryCode",
                table: "PublicHolidays",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "PublicHolidays",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "AN8",
                table: "Employees",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<Guid>(
                name: "ManagerId",
                table: "Employees",
                type: "uuid",
                nullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "Reason",
                table: "AbsenceRequests",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text"
            );

            migrationBuilder.AddColumn<string>(
                name: "Diagnosis",
                table: "AbsenceRequests",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "TreatingDoctor",
                table: "AbsenceRequests",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true
            );

            migrationBuilder.UpdateData(
                table: "AbsenceTypes",
                keyColumn: "Id",
                keyValue: new Guid("a2222222-2222-2222-2222-222222222222"),
                column: "RequiresDoctor",
                value: true
            );

            migrationBuilder.UpdateData(
                table: "AbsenceTypes",
                keyColumn: "Id",
                keyValue: new Guid("a3333333-3333-3333-3333-333333333333"),
                columns: new[] { "CalculationType", "Description", "MaxDaysPerYear" },
                values: new object[]
                {
                    "CalendarDays",
                    "Licencia por matrimonio (7 días consecutivos)",
                    7,
                }
            );

            migrationBuilder.UpdateData(
                table: "AbsenceTypes",
                keyColumn: "Id",
                keyValue: new Guid("a5555555-5555-5555-5555-555555555555"),
                columns: new[] { "Description", "MaxDaysPerYear", "Name" },
                values: new object[]
                {
                    "Licencia por nacimiento (10 días laborables)",
                    10,
                    "Nacimiento",
                }
            );

            migrationBuilder.InsertData(
                table: "AbsenceTypes",
                columns: new[]
                {
                    "Id",
                    "CalculationType",
                    "DeductsFromBalance",
                    "Description",
                    "IsActive",
                    "MaxDaysPerYear",
                    "Name",
                    "ParentId",
                    "RequiresAttachment",
                    "RequiresDoctor",
                },
                values: new object[]
                {
                    new Guid("a6666666-6666-6666-6666-666666666666"),
                    "WorkingDays",
                    false,
                    "Licencia por cambio de residencia (1 día laborable)",
                    true,
                    1,
                    "Cambio de Residencia",
                    null,
                    false,
                    false,
                }
            );

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: new Guid("e1111111-1111-1111-1111-111111111111"),
                columns: new[] { "AN8", "ManagerId" },
                values: new object[] { "", null }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000001"),
                columns: new[] { "CountryCode", "Name" },
                values: new object[] { "DO", "Año Nuevo" }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000002"),
                columns: new[] { "CountryCode", "Name" },
                values: new object[] { "DO", "Día de Reyes" }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000003"),
                columns: new[] { "CountryCode", "Name" },
                values: new object[] { "DO", "Día de la Altagracia" }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000004"),
                columns: new[] { "CountryCode", "Name" },
                values: new object[] { "DO", "Día de Duarte" }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000005"),
                columns: new[] { "CountryCode", "Name" },
                values: new object[] { "DO", "Independencia Nacional" }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000006"),
                columns: new[] { "CountryCode", "Name" },
                values: new object[] { "DO", "Viernes Santo" }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000007"),
                columns: new[] { "CountryCode", "Name" },
                values: new object[] { "DO", "Día del Trabajo" }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000008"),
                columns: new[] { "CountryCode", "Name" },
                values: new object[] { "DO", "Corpus Christi" }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000009"),
                columns: new[] { "CountryCode", "Name" },
                values: new object[] { "DO", "Día de la Restauración" }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-00000000000a"),
                columns: new[] { "CountryCode", "Name" },
                values: new object[] { "DO", "Día de las Mercedes" }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-00000000000b"),
                columns: new[] { "CountryCode", "Name" },
                values: new object[] { "DO", "Día de la Constitución" }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-00000000000c"),
                columns: new[] { "CountryCode", "Name" },
                values: new object[] { "DO", "Día de Navidad" }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Users_ExternalId",
                table: "Users",
                column: "ExternalId",
                unique: true,
                filter: "\"ExternalId\" IS NOT NULL"
            );

            migrationBuilder.CreateIndex(
                name: "IX_PublicHolidays_Date_CountryCode",
                table: "PublicHolidays",
                columns: new[] { "Date", "CountryCode" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_Employees_ManagerId",
                table: "Employees",
                column: "ManagerId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Employees_ManagerId",
                table: "Employees",
                column: "ManagerId",
                principalTable: "Employees",
                principalColumn: "Id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Employees_ManagerId",
                table: "Employees"
            );

            migrationBuilder.DropIndex(name: "IX_Users_ExternalId", table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_PublicHolidays_Date_CountryCode",
                table: "PublicHolidays"
            );

            migrationBuilder.DropIndex(name: "IX_Employees_ManagerId", table: "Employees");

            migrationBuilder.DeleteData(
                table: "AbsenceTypes",
                keyColumn: "Id",
                keyValue: new Guid("a6666666-6666-6666-6666-666666666666")
            );

            migrationBuilder.DropColumn(name: "ExternalId", table: "Users");

            migrationBuilder.DropColumn(name: "PasswordHash", table: "Users");

            migrationBuilder.DropColumn(name: "CountryCode", table: "PublicHolidays");

            migrationBuilder.DropColumn(name: "Name", table: "PublicHolidays");

            migrationBuilder.DropColumn(name: "AN8", table: "Employees");

            migrationBuilder.DropColumn(name: "ManagerId", table: "Employees");

            migrationBuilder.DropColumn(name: "Diagnosis", table: "AbsenceRequests");

            migrationBuilder.DropColumn(name: "TreatingDoctor", table: "AbsenceRequests");

            migrationBuilder.RenameColumn(
                name: "Role",
                table: "Users",
                newName: "ActiveDirectoryObjectId"
            );

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "PublicHolidays",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AlterColumn<string>(
                name: "Reason",
                table: "AbsenceRequests",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500
            );

            migrationBuilder.UpdateData(
                table: "AbsenceTypes",
                keyColumn: "Id",
                keyValue: new Guid("a2222222-2222-2222-2222-222222222222"),
                column: "RequiresDoctor",
                value: false
            );

            migrationBuilder.UpdateData(
                table: "AbsenceTypes",
                keyColumn: "Id",
                keyValue: new Guid("a3333333-3333-3333-3333-333333333333"),
                columns: new[] { "CalculationType", "Description", "MaxDaysPerYear" },
                values: new object[]
                {
                    "WorkingDays",
                    "Licencia por matrimonio (5 días laborables)",
                    5,
                }
            );

            migrationBuilder.UpdateData(
                table: "AbsenceTypes",
                keyColumn: "Id",
                keyValue: new Guid("a5555555-5555-5555-5555-555555555555"),
                columns: new[] { "Description", "MaxDaysPerYear", "Name" },
                values: new object[]
                {
                    "Licencia por paternidad (2 días laborables)",
                    2,
                    "Paternidad",
                }
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000001"),
                column: "Year",
                value: 2026
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000002"),
                column: "Year",
                value: 2026
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000003"),
                column: "Year",
                value: 2026
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000004"),
                column: "Year",
                value: 2026
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000005"),
                column: "Year",
                value: 2026
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000006"),
                column: "Year",
                value: 2026
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000007"),
                column: "Year",
                value: 2026
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000008"),
                column: "Year",
                value: 2026
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-000000000009"),
                column: "Year",
                value: 2026
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-00000000000a"),
                column: "Year",
                value: 2026
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-00000000000b"),
                column: "Year",
                value: 2026
            );

            migrationBuilder.UpdateData(
                table: "PublicHolidays",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0000-0000-0000-00000000000c"),
                column: "Year",
                value: 2026
            );

            migrationBuilder.CreateIndex(
                name: "IX_Users_ActiveDirectoryObjectId",
                table: "Users",
                column: "ActiveDirectoryObjectId",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_PublicHolidays_Date_Year",
                table: "PublicHolidays",
                columns: new[] { "Date", "Year" },
                unique: true
            );
        }
    }
}
