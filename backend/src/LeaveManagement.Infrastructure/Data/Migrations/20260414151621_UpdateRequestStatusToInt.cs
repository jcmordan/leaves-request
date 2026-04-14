using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeaveManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRequestStatusToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"ALTER TABLE ""ApprovalHistories"" ALTER COLUMN ""StatusAfterAction"" TYPE integer USING CASE ""StatusAfterAction"" WHEN 'Pending' THEN 0 WHEN 'PendingCoordinatorApproval' THEN 1 WHEN 'Approved' THEN 2 WHEN 'Rejected' THEN 3 WHEN 'Cancelled' THEN 4 WHEN 'ModificationRequested' THEN 5 ELSE 0 END;");
            migrationBuilder.Sql(@"ALTER TABLE ""AbsenceRequests"" ALTER COLUMN ""Status"" TYPE integer USING CASE ""Status"" WHEN 'Pending' THEN 0 WHEN 'PendingCoordinatorApproval' THEN 1 WHEN 'Approved' THEN 2 WHEN 'Rejected' THEN 3 WHEN 'Cancelled' THEN 4 WHEN 'ModificationRequested' THEN 5 ELSE 0 END;");

            migrationBuilder.AlterColumn<int>(
                name: "StatusAfterAction",
                table: "ApprovalHistories",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "AbsenceRequests",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"ALTER TABLE ""ApprovalHistories"" ALTER COLUMN ""StatusAfterAction"" TYPE text USING CASE ""StatusAfterAction"" WHEN 0 THEN 'Pending' WHEN 1 THEN 'PendingCoordinatorApproval' WHEN 2 THEN 'Approved' WHEN 3 THEN 'Rejected' WHEN 4 THEN 'Cancelled' WHEN 5 THEN 'ModificationRequested' ELSE 'Pending' END;");
            migrationBuilder.Sql(@"ALTER TABLE ""AbsenceRequests"" ALTER COLUMN ""Status"" TYPE text USING CASE ""Status"" WHEN 0 THEN 'Pending' WHEN 1 THEN 'PendingCoordinatorApproval' WHEN 2 THEN 'Approved' WHEN 3 THEN 'Rejected' WHEN 4 THEN 'Cancelled' WHEN 5 THEN 'ModificationRequested' ELSE 'Pending' END;");

            migrationBuilder.AlterColumn<string>(
                name: "StatusAfterAction",
                table: "ApprovalHistories",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "AbsenceRequests",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }
    }
}
