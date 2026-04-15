using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System.Linq;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).ValueGeneratedOnAdd().HasDefaultValueSql("uuidv7()");

        builder.HasIndex(u => u.ExternalId).IsUnique().HasFilter("\"ExternalId\" IS NOT NULL");
        builder.Property(u => u.ExternalId).IsRequired(false).HasMaxLength(128);

        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
        builder.Property(u => u.FullName).IsRequired().HasMaxLength(256);

        builder.Property(u => u.PasswordHash).IsRequired(false).HasMaxLength(1024);

        var propertyBuilder = builder.Property(u => u.Roles);

        if (builder.Metadata.Model.GetAnnotations().Any(a => 
            a.Name.Contains("Npgsql") || 
            a.Name.Contains("Postgres") || 
            (a.Value?.ToString()?.Contains("Npgsql") ?? false)))
        {
            propertyBuilder.HasConversion(
                v => v.Select(r => (int)r).ToArray(),
                v => v.Select(r => (UserRole)r).ToList());
        }
        else
        {
            propertyBuilder.HasConversion(
                v => string.Join(",", v.Select(r => (int)r)),
                v => v.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                      .Select(s => (UserRole)int.Parse(s))
                      .ToList());
        }

        propertyBuilder.Metadata.SetValueComparer(new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<UserRole>>(
            (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToList()));
    }
}
