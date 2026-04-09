using System;
using System.Collections.Generic;

namespace LeaveManagement.Domain.Entities;

public class Employee
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string AN8 { get; set; } = string.Empty;
    public string NationalId { get; set; } = string.Empty;

    public Guid? JobTitleId { get; set; }

    public Guid DepartmentId { get; set; }

    public Guid? DepartmentSectionId { get; set; }

    public DateTime HireDate { get; set; }
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public Guid? ManagerId { get; set; }
    public Employee? Manager { get; set; }

    public Guid CompanyId { get; set; }

    public bool IsActive { get; set; } = true;

    public Company? Company { get; set; }
    public DepartmentSection? DepartmentSection { get; set; }

    public Department? Department { get; set; }

    public JobTitle? JobTitle { get; set; }

    public ICollection<Employee> Subordinates { get; set; } = new List<Employee>();

}
