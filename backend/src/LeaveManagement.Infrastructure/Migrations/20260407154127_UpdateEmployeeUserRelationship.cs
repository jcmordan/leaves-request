using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeaveManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEmployeeUserRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[]
                {
                    "Id",
                    "CreatedAt",
                    "Email",
                    "ExternalId",
                    "FullName",
                    "IsActive",
                    "PasswordHash",
                    "Role",
                    "UpdatedAt",
                },
                values: new object[]
                {
                    new Guid("a1111111-1111-1111-1111-111111111111"),
                    new DateTime(2023, 11, 15, 0, 0, 0, 0, DateTimeKind.Utc),
                    "juan.perez@example.do",
                    null,
                    "Juan Pérez",
                    true,
                    "$2a$11$q5MkhSBq8S7.eB.Y7.eB.Y7.eB.Y7.eB.Y7.eB.Y7.eB.Y7.eB.Y7.eB.Y",
                    "HRManager",
                    null,
                }
            );

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: new Guid("e1111111-1111-1111-1111-111111111111"),
                column: "UserId",
                value: new Guid("a1111111-1111-1111-1111-111111111111")
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1111111-1111-1111-1111-111111111111")
            );

            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: new Guid("e1111111-1111-1111-1111-111111111111"),
                column: "UserId",
                value: null
            );
        }
    }
}
