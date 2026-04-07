namespace LeaveManagement.Domain.Enums;

public enum RequestStatus
{
    Pending,
    PendingCoordinatorApproval,
    Approved,
    Rejected,
    Cancelled,
    ModificationRequested
}
