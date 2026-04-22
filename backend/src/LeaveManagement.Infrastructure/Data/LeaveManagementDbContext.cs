using DotNetEnv;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Infrastructure.Data.Configurations;
using LeaveManagement.Infrastructure.Data.Seeders;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Data;

public class LeaveManagementDbContext(DbContextOptions<LeaveManagementDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<DepartmentSection> DepartmentSections { get; set; }
    public DbSet<Company> Companies { get; set; }
    public DbSet<JobTitle> JobTitles { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<EmployeeSupervisor> EmployeeSupervisors { get; set; }
    public DbSet<PublicHoliday> PublicHolidays { get; set; }
    public DbSet<AbsenceType> AbsenceTypes { get; set; }
    public DbSet<LeaveEntitlement> LeaveEntitlements { get; set; }
    public DbSet<EntitlementPolicy> EntitlementPolicies { get; set; }
    public DbSet<AbsenceRequest> AbsenceRequests { get; set; }
    public DbSet<Attachment> Attachments { get; set; }
    public DbSet<ApprovalHistory> ApprovalHistories { get; set; }
    public DbSet<Configuration> Configurations { get; set; }
    public DbSet<VacationSync> VacationSyncs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Load .env from root, searching up in the directory tree
        var currentDirInfo = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (currentDirInfo != null && !File.Exists(Path.Combine(currentDirInfo.FullName, ".env")))
        {
            currentDirInfo = currentDirInfo.Parent;
        }

        if (currentDirInfo != null)
        {
            DotNetEnv.Env.Load(Path.Combine(currentDirInfo.FullName, ".env"));
        }


        if (Database.IsNpgsql())
        {
            modelBuilder.HasPostgresExtension("pgcrypto");
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(LeaveManagementDbContext).Assembly);
        }
        else
        {
            // For InMemory or other providers, apply configurations but without Postgres-specific default SQL
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(LeaveManagementDbContext).Assembly);
        }
    }
}
