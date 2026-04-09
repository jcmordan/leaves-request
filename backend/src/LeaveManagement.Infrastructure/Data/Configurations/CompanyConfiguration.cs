using LeaveManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).ValueGeneratedOnAdd().HasDefaultValueSql("uuidv7()");
        builder.Property(d => d.Name).IsRequired().HasMaxLength(128);
        builder.Property(d => d.IsActive).IsRequired().HasDefaultValue(true);
    }
}
