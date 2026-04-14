using System;

namespace LeaveManagement.Domain.Entities;

public class Attachment
{
    public Guid Id { get; set; }
    public Guid AbsenceRequestId { get; set; }
    public AbsenceRequest? AbsenceRequest { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
}
