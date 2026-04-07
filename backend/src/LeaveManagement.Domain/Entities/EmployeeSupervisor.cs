using System;

namespace LeaveManagement.Domain.Entities;

public class EmployeeSupervisor
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public Guid SupervisorId { get; set; }
    public Employee? Supervisor { get; set; }
}
