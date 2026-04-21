using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LeaveManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase().Annotation("Npgsql:PostgresExtension:pgcrypto", ",,");

            migrationBuilder.CreateTable(
                name: "AbsenceTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "uuid",
                        nullable: false,
                        defaultValueSql: "gen_random_uuid()"
                    ),
                    Name = table.Column<string>(
                        type: "character varying(64)",
                        maxLength: 64,
                        nullable: false
                    ),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CalculationType = table.Column<string>(type: "text", nullable: false),
                    RequiresAttachment = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresDoctor = table.Column<bool>(type: "boolean", nullable: false),
                    MaxDaysPerYear = table.Column<int>(type: "integer", nullable: false),
                    DeductsFromBalance = table.Column<bool>(type: "boolean", nullable: false),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AbsenceTypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AbsenceTypes_AbsenceTypes_ParentId",
                        column: x => x.ParentId,
                        principalTable: "AbsenceTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "uuid",
                        nullable: false,
                        defaultValueSql: "gen_random_uuid()"
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
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "PublicHolidays",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "uuid",
                        nullable: false,
                        defaultValueSql: "gen_random_uuid()"
                    ),
                    Date = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    Description = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: false
                    ),
                    Year = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicHolidays", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "uuid",
                        nullable: false,
                        defaultValueSql: "gen_random_uuid()"
                    ),
                    ActiveDirectoryObjectId = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: false
                    ),
                    FullName = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: false
                    ),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "uuid",
                        nullable: false,
                        defaultValueSql: "gen_random_uuid()"
                    ),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    EmployeeCode = table.Column<string>(type: "text", nullable: false),
                    NationalId = table.Column<string>(type: "text", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    HireDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    Role = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Employees_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_Employees_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id"
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "AbsenceRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "uuid",
                        nullable: false,
                        defaultValueSql: "gen_random_uuid()"
                    ),
                    EmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    AbsenceTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    EndDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    TotalDaysRequested = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    RequesterEmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AbsenceRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AbsenceRequests_AbsenceTypes_AbsenceTypeId",
                        column: x => x.AbsenceTypeId,
                        principalTable: "AbsenceTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_AbsenceRequests_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "FK_AbsenceRequests_Employees_RequesterEmployeeId",
                        column: x => x.RequesterEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "EmployeeSupervisors",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "uuid",
                        nullable: false,
                        defaultValueSql: "gen_random_uuid()"
                    ),
                    EmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupervisorId = table.Column<Guid>(type: "uuid", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeSupervisors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeSupervisors_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_EmployeeSupervisors_Employees_SupervisorId",
                        column: x => x.SupervisorId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "VacationBalances",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "uuid",
                        nullable: false,
                        defaultValueSql: "gen_random_uuid()"
                    ),
                    EmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    TotalDays = table.Column<int>(type: "integer", nullable: false),
                    UsedDays = table.Column<int>(type: "integer", nullable: false),
                    CarriedOverDays = table.Column<int>(type: "integer", nullable: false),
                    ExpiresAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VacationBalances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VacationBalances_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "ApprovalHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "uuid",
                        nullable: false,
                        defaultValueSql: "gen_random_uuid()"
                    ),
                    AbsenceRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApproverEmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    Comment = table.Column<string>(type: "text", nullable: false),
                    ActionDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    StatusAfterAction = table.Column<string>(type: "text", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalHistories_AbsenceRequests_AbsenceRequestId",
                        column: x => x.AbsenceRequestId,
                        principalTable: "AbsenceRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_ApprovalHistories_Employees_ApproverEmployeeId",
                        column: x => x.ApproverEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "Attachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "uuid",
                        nullable: false,
                        defaultValueSql: "gen_random_uuid()"
                    ),
                    AbsenceRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    AbsenceRequestId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    FileName = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: false
                    ),
                    FileType = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    Data = table.Column<byte[]>(type: "bytea", nullable: false),
                    UploadedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Attachments_AbsenceRequests_AbsenceRequestId",
                        column: x => x.AbsenceRequestId,
                        principalTable: "AbsenceRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_Attachments_AbsenceRequests_AbsenceRequestId1",
                        column: x => x.AbsenceRequestId1,
                        principalTable: "AbsenceRequests",
                        principalColumn: "Id"
                    );
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
                values: new object[,]
                {
                    {
                        new Guid("a1111111-1111-1111-1111-111111111111"),
                        "WorkingDays",
                        true,
                        "Vacaciones anuales reglamentarias",
                        true,
                        14,
                        "Vacaciones",
                        null,
                        false,
                        false,
                    },
                    {
                        new Guid("a2222222-2222-2222-2222-222222222222"),
                        "CalendarDays",
                        false,
                        "Licencia por enfermedad con certificado médico",
                        true,
                        30,
                        "Licencia Médica",
                        null,
                        true,
                        false,
                    },
                    {
                        new Guid("a3333333-3333-3333-3333-333333333333"),
                        "WorkingDays",
                        false,
                        "Licencia por matrimonio (5 días laborables)",
                        true,
                        5,
                        "Matrimonio",
                        null,
                        false,
                        false,
                    },
                    {
                        new Guid("a4444444-4444-4444-4444-444444444444"),
                        "WorkingDays",
                        false,
                        "Licencia por fallecimiento de pariente directo (3 días laborables)",
                        true,
                        3,
                        "Fallecimiento Pariente",
                        null,
                        false,
                        false,
                    },
                    {
                        new Guid("a5555555-5555-5555-5555-555555555555"),
                        "WorkingDays",
                        false,
                        "Licencia por paternidad (2 días laborables)",
                        true,
                        2,
                        "Paternidad",
                        null,
                        false,
                        false,
                    },
                }
            );

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "Code", "IsActive", "Name" },
                values: new object[,]
                {
                    {
                        new Guid("d1111111-1111-1111-1111-111111111111"),
                        "RH",
                        true,
                        "Recursos Humanos",
                    },
                    {
                        new Guid("d2222222-2222-2222-2222-222222222222"),
                        "IT",
                        true,
                        "Tecnología de la Información",
                    },
                    { new Guid("d3333333-3333-3333-3333-333333333333"), "FIN", true, "Finanzas" },
                    {
                        new Guid("d4444444-4444-4444-4444-444444444444"),
                        "OPS",
                        true,
                        "Operaciones",
                    },
                    { new Guid("d5555555-5555-5555-5555-555555555555"), "SLS", true, "Ventas" },
                    { new Guid("d6666666-6666-6666-6666-666666666666"), "LGL", true, "Legal" },
                }
            );

            migrationBuilder.InsertData(
                table: "PublicHolidays",
                columns: new[] { "Id", "Date", "Description", "Year" },
                values: new object[,]
                {
                    {
                        new Guid("f0000000-0000-0000-0000-000000000001"),
                        new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Año Nuevo",
                        2026,
                    },
                    {
                        new Guid("f0000000-0000-0000-0000-000000000002"),
                        new DateTime(2026, 1, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Día de Reyes",
                        2026,
                    },
                    {
                        new Guid("f0000000-0000-0000-0000-000000000003"),
                        new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Día de la Altagracia",
                        2026,
                    },
                    {
                        new Guid("f0000000-0000-0000-0000-000000000004"),
                        new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Día de Duarte",
                        2026,
                    },
                    {
                        new Guid("f0000000-0000-0000-0000-000000000005"),
                        new DateTime(2026, 2, 27, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Independencia Nacional",
                        2026,
                    },
                    {
                        new Guid("f0000000-0000-0000-0000-000000000006"),
                        new DateTime(2026, 4, 3, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Viernes Santo",
                        2026,
                    },
                    {
                        new Guid("f0000000-0000-0000-0000-000000000007"),
                        new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Día del Trabajo",
                        2026,
                    },
                    {
                        new Guid("f0000000-0000-0000-0000-000000000008"),
                        new DateTime(2026, 6, 4, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Corpus Christi",
                        2026,
                    },
                    {
                        new Guid("f0000000-0000-0000-0000-000000000009"),
                        new DateTime(2026, 8, 16, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Día de la Restauración",
                        2026,
                    },
                    {
                        new Guid("f0000000-0000-0000-0000-00000000000a"),
                        new DateTime(2026, 9, 24, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Día de las Mercedes",
                        2026,
                    },
                    {
                        new Guid("f0000000-0000-0000-0000-00000000000b"),
                        new DateTime(2026, 11, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Día de la Constitución",
                        2026,
                    },
                    {
                        new Guid("f0000000-0000-0000-0000-00000000000c"),
                        new DateTime(2026, 12, 25, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Día de Navidad",
                        2026,
                    },
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_AbsenceRequests_AbsenceTypeId",
                table: "AbsenceRequests",
                column: "AbsenceTypeId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_AbsenceRequests_EmployeeId",
                table: "AbsenceRequests",
                column: "EmployeeId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_AbsenceRequests_RequesterEmployeeId",
                table: "AbsenceRequests",
                column: "RequesterEmployeeId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_AbsenceTypes_ParentId",
                table: "AbsenceTypes",
                column: "ParentId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalHistories_AbsenceRequestId",
                table: "ApprovalHistories",
                column: "AbsenceRequestId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalHistories_ApproverEmployeeId",
                table: "ApprovalHistories",
                column: "ApproverEmployeeId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_AbsenceRequestId",
                table: "Attachments",
                column: "AbsenceRequestId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_AbsenceRequestId1",
                table: "Attachments",
                column: "AbsenceRequestId1"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Departments_Code",
                table: "Departments",
                column: "Code",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DepartmentId",
                table: "Employees",
                column: "DepartmentId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Employees_EmployeeCode",
                table: "Employees",
                column: "EmployeeCode",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_Employees_NationalId",
                table: "Employees",
                column: "NationalId",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UserId",
                table: "Employees",
                column: "UserId",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSupervisors_EmployeeId",
                table: "EmployeeSupervisors",
                column: "EmployeeId",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSupervisors_SupervisorId",
                table: "EmployeeSupervisors",
                column: "SupervisorId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_PublicHolidays_Date_Year",
                table: "PublicHolidays",
                columns: new[] { "Date", "Year" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_Users_ActiveDirectoryObjectId",
                table: "Users",
                column: "ActiveDirectoryObjectId",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_VacationBalances_EmployeeId_Year",
                table: "VacationBalances",
                columns: new[] { "EmployeeId", "Year" },
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ApprovalHistories");

            migrationBuilder.DropTable(name: "Attachments");

            migrationBuilder.DropTable(name: "EmployeeSupervisors");

            migrationBuilder.DropTable(name: "PublicHolidays");

            migrationBuilder.DropTable(name: "VacationBalances");

            migrationBuilder.DropTable(name: "AbsenceRequests");

            migrationBuilder.DropTable(name: "AbsenceTypes");

            migrationBuilder.DropTable(name: "Employees");

            migrationBuilder.DropTable(name: "Departments");

            migrationBuilder.DropTable(name: "Users");
        }
    }
}
