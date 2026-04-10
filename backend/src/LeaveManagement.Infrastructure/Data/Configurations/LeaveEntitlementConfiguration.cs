using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class LeaveEntitlementConfiguration : IEntityTypeConfiguration<LeaveEntitlement>
{
    public void Configure(EntityTypeBuilder<LeaveEntitlement> builder)
    {
        builder.ToTable("LeaveEntitlements");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .ValueGeneratedOnAdd();

        builder.Property(e => e.Year)
            .IsRequired();

        builder.Property(e => e.BaseDays)
            .IsRequired();

        builder.HasIndex(e => new { e.EmployeeId, e.Year, e.AbsenceTypeId })
            .IsUnique();

        builder.HasOne(e => e.Employee)
            .WithMany()
            .HasForeignKey(e => e.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.AbsenceType)
            .WithMany()
            .HasForeignKey(e => e.AbsenceTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
