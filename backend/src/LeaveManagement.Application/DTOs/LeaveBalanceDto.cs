using System;

namespace LeaveManagement.Application.DTOs;

/// <summary>
/// Data transfer object for the calculated leave balance of an employee.
/// </summary>
public class LeaveBalanceDto
{
    public int TotalEntitlement { get; set; }
    public int Taken { get; set; }
    public int Remaining { get; set; }

    public double AvailablePercentage =>
        TotalEntitlement > 0 ? Math.Round((double)Remaining / TotalEntitlement * 100, 1) : 0;
}
