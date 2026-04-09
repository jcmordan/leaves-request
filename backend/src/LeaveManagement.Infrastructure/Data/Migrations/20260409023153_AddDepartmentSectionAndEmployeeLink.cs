using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LeaveManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentSectionAndEmployeeLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "VacationBalances",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Users",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "PublicHolidays",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "EmployeeSupervisors",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Employees",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()"
            );

            migrationBuilder.AddColumn<Guid>(
                name: "DepartmentSectionId",
                table: "Employees",
                type: "uuid",
                nullable: true
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Departments",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Attachments",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "ApprovalHistories",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "AbsenceTypes",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "AbsenceRequests",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()"
            );

            migrationBuilder.CreateTable(
                name: "DepartmentSections",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "uuid",
                        nullable: false,
                        defaultValueSql: "uuidv7()"
                    ),
                    Name = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    Code = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DepartmentSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DepartmentSections_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DepartmentSectionId",
                table: "Employees",
                column: "DepartmentSectionId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentSections_Code",
                table: "DepartmentSections",
                column: "Code",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentSections_DepartmentId",
                table: "DepartmentSections",
                column: "DepartmentId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_DepartmentSections_DepartmentSectionId",
                table: "Employees",
                column: "DepartmentSectionId",
                principalTable: "DepartmentSections",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_DepartmentSections_DepartmentSectionId",
                table: "Employees"
            );

            migrationBuilder.DropTable(name: "DepartmentSections");

            migrationBuilder.DropIndex(
                name: "IX_Employees_DepartmentSectionId",
                table: "Employees"
            );

            migrationBuilder.DropColumn(name: "DepartmentSectionId", table: "Employees");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "VacationBalances",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "uuidv7()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Users",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "uuidv7()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "PublicHolidays",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "uuidv7()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "EmployeeSupervisors",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "uuidv7()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Employees",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "uuidv7()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Departments",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "uuidv7()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Attachments",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "uuidv7()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "ApprovalHistories",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "uuidv7()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "AbsenceTypes",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "uuidv7()"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "AbsenceRequests",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "uuidv7()"
            );
        }
    }
}
