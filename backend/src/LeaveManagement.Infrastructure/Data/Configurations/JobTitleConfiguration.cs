using LeaveManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class JobTitleConfiguration : IEntityTypeConfiguration<JobTitle>
{
    public void Configure(EntityTypeBuilder<JobTitle> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).ValueGeneratedOnAdd().HasDefaultValueSql("uuidv7()");
        builder.Property(d => d.Name).IsRequired().HasMaxLength(128);
        builder.Property(d => d.Code).IsRequired(false).HasMaxLength(32);
        builder.Property(d => d.IsActive).IsRequired().HasDefaultValue(true);

        builder.HasIndex(d => d.Code).IsUnique();
        builder.HasIndex(d => d.Name).IsUnique();
    }
}
