using System.Collections.Generic;
using System.Linq;

namespace LeaveManagement.Application.DTOs;

/// <summary>
/// Data transfer object containing analysis results and dashboard metrics for leave requests.
/// </summary>
public class LeaveRequestSummary
{
    // --- Dashboard Metrics ---
    public int PendingCount { get; set; }
    public double? AvgResponseTimeHours { get; set; }
    public int ApprovedThisMonthCount { get; set; }
    public int RejectedCount { get; set; }
    public int ApprovedVsLastYearPercentage { get; set; }
    public IEnumerable<LeaveTrendDataPointDto> TrendData { get; set; } = [];
    public string? InsightMessage { get; set; }

 
    public int AvailablePercentage { get; set; }
    public int TotalTeamMembers { get; set; }
    public int MembersOnLeave { get; set; }
    public int PendingMembersOnLeave { get; set; }

    // --- Horizon Metrics ---
    public int UpcomingMinAvailablePercentage { get; set; }
    public DateTime? UpcomingMinAvailableDate { get; set; }

    // --- Capacity & Analysis Metrics ---
    public IEnumerable<OverlappingAbsenceDto> OverlappingAbsences { get; set; } = [];
}
