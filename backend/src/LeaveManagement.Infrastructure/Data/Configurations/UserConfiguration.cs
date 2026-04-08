using LeaveManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasDefaultValueSql("gen_random_uuid()");

        builder.HasIndex(u => u.ExternalId).IsUnique().HasFilter("\"ExternalId\" IS NOT NULL");
        builder.Property(u => u.ExternalId).IsRequired(false).HasMaxLength(128);

        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
        builder.Property(u => u.FullName).IsRequired().HasMaxLength(256);

        builder.Property(u => u.PasswordHash).IsRequired(false).HasMaxLength(1024);

        builder.Property(u => u.Role).HasConversion<string>();
    }
}
