using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class EntitlementPolicyConfiguration : IEntityTypeConfiguration<EntitlementPolicy>
{
    public void Configure(EntityTypeBuilder<EntitlementPolicy> builder)
    {
        builder.ToTable("EntitlementPolicies");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .ValueGeneratedOnAdd();

        builder.Property(e => e.MinTenureYears)
            .IsRequired();

        builder.Property(e => e.EntitlementDays)
            .IsRequired();

        builder.HasIndex(e => new { e.AbsenceTypeId, e.MinTenureYears })
            .IsUnique();

        builder.HasOne(e => e.AbsenceType)
            .WithMany()
            .HasForeignKey(e => e.AbsenceTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
