using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class AbsenceRequestConfiguration : IEntityTypeConfiguration<AbsenceRequest>
{
    public void Configure(EntityTypeBuilder<AbsenceRequest> builder)
    {
        builder.HasKey(ar => ar.Id);
        builder.Property(ar => ar.Id).ValueGeneratedOnAdd();
        
        if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Testing")
        {
             builder.Property(ar => ar.Id).HasDefaultValueSql("uuidv7()");
        }

        builder.HasOne(ar => ar.Employee)
            .WithMany()
            .HasForeignKey(ar => ar.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ar => ar.RequesterEmployee)
            .WithMany()
            .HasForeignKey(ar => ar.RequesterEmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ar => ar.AbsenceType)
            .WithMany()
            .HasForeignKey(ar => ar.AbsenceTypeId);

        builder.HasOne(ar => ar.AbsenceSubType)
            .WithMany()
            .HasForeignKey(ar => ar.AbsenceSubTypeId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasMany(ar => ar.Attachments)
            .WithOne(a => a.AbsenceRequest)
            .HasForeignKey(a => a.AbsenceRequestId);
        
        builder.HasMany(ar => ar.ApprovalHistories)
            .WithOne()
            .HasForeignKey(ah => ah.AbsenceRequestId);

        builder.Property(ar => ar.Reason).HasMaxLength(500);
        builder.Property(ar => ar.Diagnosis).HasMaxLength(256);
        builder.Property(ar => ar.TreatingDoctor).HasMaxLength(128);
        builder.Property(ar => ar.TotalDaysRequested).IsRequired();
    }
}
