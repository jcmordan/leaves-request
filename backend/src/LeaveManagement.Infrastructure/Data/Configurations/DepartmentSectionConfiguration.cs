using LeaveManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class DepartmentSectionConfiguration : IEntityTypeConfiguration<DepartmentSection>
{
    public void Configure(EntityTypeBuilder<DepartmentSection> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).ValueGeneratedOnAdd().HasDefaultValueSql("uuidv7()");
        builder.Property(d => d.Name).IsRequired().HasMaxLength(128);
        builder.Property(d => d.Code).IsRequired(false).HasMaxLength(32);
        builder.HasIndex(d => d.Code).IsUnique();
        builder
            .HasOne(d => d.Department)
            .WithMany(d => d.Sections)
            .HasForeignKey(d => d.DepartmentId);
    }
}
