using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeaveManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiRoleArraySupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Add the new Roles array column
            migrationBuilder.AddColumn<int[]>(
                name: "Roles",
                table: "Users",
                type: "integer[]",
                nullable: false,
                defaultValue: new int[0]);

            // 2. Migrate existing textual data to the new integer array
            migrationBuilder.Sql(@"
                UPDATE ""Users"" SET ""Roles"" = ARRAY[
                    CASE ""Role""
                        WHEN 'Admin' THEN 3
                        WHEN 'HRManager' THEN 2
                        WHEN 'Manager' THEN 1
                        WHEN 'Employee' THEN 0
                        ELSE 0
                    END
                ]");

            // 3. Drop the old Role column
            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1. Add back the Role column
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            // 2. Migrate data back (taking the first role from the array)
            migrationBuilder.Sql(@"
                UPDATE ""Users"" SET ""Role"" = 
                    CASE ""Roles""[1]
                        WHEN 3 THEN 'Admin'
                        WHEN 2 THEN 'HRManager'
                        WHEN 1 THEN 'Manager'
                        WHEN 0 THEN 'Employee'
                        ELSE 'Employee'
                    END
            ");

            // 3. Drop the Roles column
            migrationBuilder.DropColumn(
                name: "Roles",
                table: "Users");
        }
    }
}
