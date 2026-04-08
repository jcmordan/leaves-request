using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data.Configurations;
using LeaveManagement.Infrastructure.Data.Seeders;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;

namespace LeaveManagement.Infrastructure.Data;

public class LeaveManagementDbContext : DbContext
{
    public LeaveManagementDbContext(DbContextOptions<LeaveManagementDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<EmployeeSupervisor> EmployeeSupervisors { get; set; }
    public DbSet<PublicHoliday> PublicHolidays { get; set; }
    public DbSet<AbsenceType> AbsenceTypes { get; set; }
    public DbSet<VacationBalance> VacationBalances { get; set; }
    public DbSet<AbsenceRequest> AbsenceRequests { get; set; }
    public DbSet<Attachment> Attachments { get; set; }
    public DbSet<ApprovalHistory> ApprovalHistories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Load .env from root for migrations/design-time tools
        var currentDir = Directory.GetCurrentDirectory();
        var envPath = Path.GetFullPath(Path.Combine(currentDir, "../../../.env"));
        if (File.Exists(envPath))
        {
            DotNetEnv.Env.Load(envPath);
        }

        modelBuilder.HasPostgresExtension("pgcrypto");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LeaveManagementDbContext).Assembly);

        DepartmentSeeder.Seed(modelBuilder);
        AbsenceTypeSeeder.Seed(modelBuilder);
        PublicHolidaySeeder.Seed(modelBuilder);
    }
}
