using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeaveManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorRoleUserAndCleanSeeding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_AbsenceRequests_AbsenceRequestId1",
                table: "Attachments");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_AbsenceRequestId1",
                table: "Attachments");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "AbsenceRequestId1",
                table: "Attachments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Employees",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "AbsenceRequestId1",
                table: "Attachments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_AbsenceRequestId1",
                table: "Attachments",
                column: "AbsenceRequestId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_AbsenceRequests_AbsenceRequestId1",
                table: "Attachments",
                column: "AbsenceRequestId1",
                principalTable: "AbsenceRequests",
                principalColumn: "Id");
        }
    }
}
