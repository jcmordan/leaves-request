using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class AbsenceTypeConfiguration : IEntityTypeConfiguration<AbsenceType>
{
    public void Configure(EntityTypeBuilder<AbsenceType> builder)
    {
        builder.HasKey(at => at.Id);
        builder.Property(at => at.Id).ValueGeneratedOnAdd().HasDefaultValueSql("uuidv7()");
        builder.Property(at => at.Name).IsRequired().HasMaxLength(64);
        builder.Property(at => at.CalculationType).HasConversion<string>();

        builder.HasOne(at => at.Parent)
            .WithMany(at => at.Children)
            .HasForeignKey(at => at.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
