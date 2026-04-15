namespace LeaveManagement.Application.DTOs;

public class OverlappingAbsenceDto
{
    public string EmployeeName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
