using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class ApprovalHistoryConfiguration : IEntityTypeConfiguration<ApprovalHistory>
{
    public void Configure(EntityTypeBuilder<ApprovalHistory> builder)
    {
        builder.HasKey(ah => ah.Id);
        builder.Property(ah => ah.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(ah => ah.Action).HasConversion<string>();
        builder.Property(ah => ah.StatusAfterAction).HasConversion<string>();

        builder.HasOne(ah => ah.Approver)
            .WithMany()
            .HasForeignKey(ah => ah.ApproverEmployeeId);
    }
}
