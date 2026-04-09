using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class EmployeeSupervisorConfiguration : IEntityTypeConfiguration<EmployeeSupervisor>
{
    public void Configure(EntityTypeBuilder<EmployeeSupervisor> builder)
    {
         builder.HasKey(es => es.Id);
        builder.Property(es => es.Id).ValueGeneratedOnAdd().HasDefaultValueSql("uuidv7()");
         builder.HasIndex(es => es.EmployeeId).IsUnique(); // One direct supervisor per employee
         builder.HasIndex(es => es.SupervisorId);

         builder.HasOne(es => es.Employee)
            .WithOne()
            .HasForeignKey<EmployeeSupervisor>(es => es.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

         builder.HasOne(es => es.Supervisor)
            .WithMany()
            .HasForeignKey(es => es.SupervisorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
