using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(a => a.FileName).IsRequired().HasMaxLength(256);
        builder.Property(a => a.FileType).IsRequired().HasMaxLength(128);
        builder.Property(a => a.Data).IsRequired();

        // Check constraint for file types if needed, handled in app logic usually
    }
}
