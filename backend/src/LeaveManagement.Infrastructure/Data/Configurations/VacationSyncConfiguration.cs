using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class VacationSyncConfiguration : IEntityTypeConfiguration<VacationSync>
{
    public void Configure(EntityTypeBuilder<VacationSync> builder)
    {
        builder.HasKey(vs => vs.Id);
        builder.Property(vs => vs.Id).ValueGeneratedOnAdd().HasDefaultValueSql("uuidv7()");
        builder.Property(vs => vs.EmployeeCode).IsRequired().HasMaxLength(32);
        builder.Property(vs => vs.Type).IsRequired();
        builder.Property(vs => vs.CreatedAt).IsRequired();

        builder.ToTable("VacationSyncs");
    }
}
