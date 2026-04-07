using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class PublicHolidayConfiguration : IEntityTypeConfiguration<PublicHoliday>
{
    public void Configure(EntityTypeBuilder<PublicHoliday> builder)
    {
        builder.HasKey(ph => ph.Id);
        builder.Property(ph => ph.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(ph => ph.Description).IsRequired().HasMaxLength(256);
        builder.HasIndex(ph => new { ph.Date, ph.CountryCode }).IsUnique();
    }
}
