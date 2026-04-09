using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class VacationBalanceConfiguration : IEntityTypeConfiguration<VacationBalance>
{
    public void Configure(EntityTypeBuilder<VacationBalance> builder)
    {
        builder.HasKey(vb => vb.Id);
        builder.Property(vb => vb.Id).ValueGeneratedOnAdd().HasDefaultValueSql("uuidv7()");
        builder.HasIndex(vb => new { vb.EmployeeId, vb.Year }).IsUnique();

        builder.HasOne(vb => vb.Employee)
            .WithMany()
            .HasForeignKey(vb => vb.EmployeeId);
    }
}
