using System.Collections.Generic;
using System.Linq;

namespace LeaveManagement.Application.DTOs;

/// <summary>
/// Data transfer object containing analysis results for an absence request.
/// </summary>
public class AbsenceAnalysisDto
{
    public IEnumerable<OverlappingAbsenceDto> OverlappingAbsences { get; set; } = Enumerable.Empty<OverlappingAbsenceDto>();
    public int AvailablePercentage { get; set; }
    public int TotalTeamMembers { get; set; }
    public int MembersOnLeave { get; set; }
    public int PendingMembersOnLeave { get; set; }
}
