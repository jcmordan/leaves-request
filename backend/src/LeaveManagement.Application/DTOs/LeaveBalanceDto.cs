using System;

namespace LeaveManagement.Application.DTOs;

/// <summary>
/// Data transfer object for the calculated leave balance of an employee.
/// </summary>
public class LeaveBalanceDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }

    public int TotalEntitlement { get; set; }
    public int Taken { get; set; }
    public int Remaining { get; set; }

    public int TotalRequests { get; set; }
    public int PendingRequests { get; set; }
    public int ApprovedRequests { get; set; }
    public int RejectedRequests { get; set; }
    public int CancelledRequests { get; set; }

    public double AvailablePercentage =>
        TotalEntitlement > 0 ? Math.Round((double)Remaining / TotalEntitlement * 100, 1) : 0;
}
