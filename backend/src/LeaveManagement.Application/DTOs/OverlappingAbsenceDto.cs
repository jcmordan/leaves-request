namespace LeaveManagement.Application.DTOs;

public class OverlappingAbsenceDto
{
    public string EmployeeName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}
