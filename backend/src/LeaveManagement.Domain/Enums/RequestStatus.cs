namespace LeaveManagement.Domain.Enums;

public enum RequestStatus
{
    Pending = 0,
    PendingCoordinatorApproval = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4,
    ModificationRequested = 5
}
