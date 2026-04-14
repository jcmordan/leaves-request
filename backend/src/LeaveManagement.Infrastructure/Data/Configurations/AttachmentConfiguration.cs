using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Infrastructure.Data.Configurations;

public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedOnAdd().HasDefaultValueSql("uuidv7()");
        builder.Property(a => a.FileName).IsRequired().HasMaxLength(256);
        builder.Property(a => a.FileType).IsRequired().HasMaxLength(128);
        builder.Property(a => a.FilePath).IsRequired().HasMaxLength(512);

        // Check constraint for file types if needed, handled in app logic usually
    }
}
