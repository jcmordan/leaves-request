using LeaveManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedOnAdd().HasDefaultValueSql("uuidv7()");
        builder.Property(e => e.Email).IsRequired(false).HasMaxLength(256);

        builder.HasIndex(e => e.NationalId).IsUnique();
        builder.HasIndex(e => e.EmployeeCode).IsUnique();
        builder.Property(e => e.AN8).HasMaxLength(20);
        builder.HasIndex(e => e.UserId).IsUnique();

        builder.HasOne(e => e.User).WithOne().HasForeignKey<Employee>(e => e.UserId);

        builder.Property(e => e.DepartmentId).IsRequired();

        builder.HasOne(e => e.Department).WithMany().HasForeignKey(e => e.DepartmentId);

        builder.HasOne(e => e.JobTitle).WithMany().HasForeignKey(e => e.JobTitleId);

        builder
            .HasOne(e => e.DepartmentSection)
            .WithMany()
            .HasForeignKey(e => e.DepartmentSectionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasOne(e => e.Company)
            .WithMany()
            .HasForeignKey(e => e.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
