using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeaveManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveVacationBalancePostRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "EmployeeId1",
                table: "AbsenceRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AbsenceRequests_EmployeeId1",
                table: "AbsenceRequests",
                column: "EmployeeId1");

            migrationBuilder.AddForeignKey(
                name: "FK_AbsenceRequests_Employees_EmployeeId1",
                table: "AbsenceRequests",
                column: "EmployeeId1",
                principalTable: "Employees",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AbsenceRequests_Employees_EmployeeId1",
                table: "AbsenceRequests");

            migrationBuilder.DropIndex(
                name: "IX_AbsenceRequests_EmployeeId1",
                table: "AbsenceRequests");

            migrationBuilder.DropColumn(
                name: "EmployeeId1",
                table: "AbsenceRequests");
        }
    }
}
