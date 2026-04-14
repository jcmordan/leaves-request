using FluentAssertions;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Services;
using LeaveManagement.Application.Tests.Helpers;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace LeaveManagement.Application.Tests.Services;

public class LeaveRequestServiceTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly IHolidayService _holidayService;
    private readonly IBalanceService _balanceService;
    private readonly LeaveRequestService _sut;
    private readonly Guid _employeeId = Guid.NewGuid();
    private readonly Guid _absenceTypeId = Guid.NewGuid();

    public LeaveRequestServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _holidayService = Substitute.For<IHolidayService>();
        _balanceService = Substitute.For<IBalanceService>();
        _sut = new LeaveRequestService(_context, _holidayService, _balanceService);

        SeedData();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private void SeedData()
    {
        _context.AbsenceTypes.Add(
            new AbsenceType
            {
                Id = _absenceTypeId,
                Name = "Vacation",
                DeductsFromBalance = true,
                CalculationType = CalculationType.WorkingDays,
                IsActive = true,
            }
        );

        _context.Employees.Add(
            new Employee
            {
                Id = _employeeId,
                FullName = "Test Employee",
                EmployeeCode = "EMP001",
                NationalId = "12345",
                HireDate = DateTime.UtcNow.AddYears(-1),
                IsActive = true,
            }
        );

        _context.SaveChanges();
    }

    [Fact]
    public async Task SubmitRequestAsync_StartDateInPast_ShouldSaveRequest()
    {
        // Arrange
        var endDate = DateTime.UtcNow;
        var startDate = endDate.AddDays(-1);

        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(2);
        _balanceService.GetEmployeeBalanceAsync(_employeeId, startDate.Year, _absenceTypeId)
            .Returns(new LeaveBalanceDto { Remaining = 10 });

        // Act
        var result = await _sut.SubmitRequestAsync(
            _employeeId,
            _absenceTypeId,
            startDate,
            endDate,
            "Reason"
        );

        // Assert
        result.Should().NotBeNull();
        result.EmployeeId.Should().Be(_employeeId);
        result.Status.Should().Be(RequestStatus.Pending);
        result.TotalDaysRequested.Should().Be(2);

        var savedRequest = await _context.AbsenceRequests.FirstOrDefaultAsync(r =>
            r.Id == result.Id
        );

        savedRequest.Should().NotBeNull();
        savedRequest!.StartDate.Should().Be(startDate);
        savedRequest!.Reason.Should().Be("Reason");
    }

    [Fact]
    public async Task SubmitRequestAsync_StartDateAfterEndDate_ShouldThrowArgumentException()
    {
        var act = () =>
            _sut.SubmitRequestAsync(
                _employeeId,
                _absenceTypeId,
                DateTime.UtcNow.AddDays(2),
                DateTime.UtcNow.AddDays(1),
                "Reason"
            );

        await act.Should()
            .ThrowAsync<ArgumentException>()
            .WithMessage("Start date must be before or equal to end date.");
    }

    [Fact]
    public async Task SubmitRequestAsync_AbsenceTypeNotFound_ShouldThrowException()
    {
        var act = () =>
            _sut.SubmitRequestAsync(
                _employeeId,
                Guid.NewGuid(),
                DateTime.UtcNow.AddDays(1),
                DateTime.UtcNow.AddDays(2),
                "Reason"
            );

        await act.Should().ThrowAsync<Exception>().WithMessage("Absence type not found.");
    }

    [Fact]
    public async Task SubmitRequestAsync_InsufficientBalance_ShouldThrowException()
    {
        var startDate = DateTime.UtcNow.AddDays(1);
        var endDate = DateTime.UtcNow.AddDays(5);

        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(5);
        _balanceService
            .GetEmployeeBalanceAsync(_employeeId, startDate.Year, _absenceTypeId)
            .Returns(
                new LeaveBalanceDto
                {
                    TotalEntitlement = 10,
                    Taken = 8,
                    Remaining = 2,
                }
            ); // Remaining = 2, Requested = 5

        var act = () =>
            _sut.SubmitRequestAsync(_employeeId, _absenceTypeId, startDate, endDate, "Reason");

        await act.Should()
            .ThrowAsync<Exception>()
            .WithMessage("Insufficient balance. Remaining: 2, Requested: 5.");
    }

    [Fact]
    public async Task SubmitRequestAsync_OverlappingRequest_ShouldThrowException()
    {
        var startDate = DateTime.UtcNow.AddDays(10);
        var endDate = DateTime.UtcNow.AddDays(12);

        _context.AbsenceRequests.Add(
            new AbsenceRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                StartDate = startDate,
                EndDate = endDate,
                Status = RequestStatus.Pending,
                RequesterEmployeeId = _employeeId,
            }
        );
        await _context.SaveChangesAsync();

        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(3);
        _balanceService
            .GetEmployeeBalanceAsync(_employeeId, startDate.Year, _absenceTypeId)
            .Returns(
                new LeaveBalanceDto
                {
                    TotalEntitlement = 10,
                    Taken = 0,
                    Remaining = 10,
                }
            );

        var act = () =>
            _sut.SubmitRequestAsync(_employeeId, _absenceTypeId, startDate, endDate, "Reason");

        await act.Should()
            .ThrowAsync<Exception>()
            .WithMessage("There is already a request for the selected dates.");
    }

    [Fact]
    public async Task SubmitRequestAsync_ValidRequest_ShouldCreateRequest()
    {
        var startDate = DateTime.UtcNow.AddDays(1);
        var endDate = DateTime.UtcNow.AddDays(2);

        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(2);
        _balanceService
            .GetEmployeeBalanceAsync(_employeeId, startDate.Year, _absenceTypeId)
            .Returns(
                new LeaveBalanceDto
                {
                    TotalEntitlement = 10,
                    Taken = 0,
                    Remaining = 10,
                }
            );

        var result = await _sut.SubmitRequestAsync(
            _employeeId,
            _absenceTypeId,
            startDate,
            endDate,
            "Vacation reason"
        );

        result.Should().NotBeNull();
        result.EmployeeId.Should().Be(_employeeId);
        result.Status.Should().Be(RequestStatus.Pending);
        result.TotalDaysRequested.Should().Be(2);

        var savedRequest = await _context.AbsenceRequests.FirstOrDefaultAsync(r =>
            r.Id == result.Id
        );
        savedRequest.Should().NotBeNull();
        savedRequest!.Reason.Should().Be("Vacation reason");
    }

    [Fact]
    public async Task SubmitRequestAsync_RequiresDoctor_MissingInfo_ShouldThrowArgumentException()
    {
        // Arrange
        var medicalTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(new AbsenceType
        {
            Id = medicalTypeId,
            Name = "Medical",
            RequiresDoctor = true,
            IsActive = true
        });
        await _context.SaveChangesAsync();

        var startDate = DateTime.UtcNow.AddDays(1);
        var endDate = DateTime.UtcNow.AddDays(2);

        // Act
        var act = () => _sut.SubmitRequestAsync(_employeeId, medicalTypeId, startDate, endDate, "Fever");

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Diagnosis and Treating Doctor are mandatory for this leave type.");
    }

    [Fact]
    public async Task SubmitRequestAsync_RequiresAttachment_MissingFile_ShouldThrowArgumentException()
    {
        // Arrange
        var medicalTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(new AbsenceType
        {
            Id = medicalTypeId,
            Name = "Medical",
            RequiresAttachment = true,
            IsActive = true
        });
        await _context.SaveChangesAsync();

        var startDate = DateTime.UtcNow.AddDays(1);
        var endDate = DateTime.UtcNow.AddDays(2);

        // Act
        var act = () => _sut.SubmitRequestAsync(_employeeId, medicalTypeId, startDate, endDate, "Fever");

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("An attachment is required for this leave type.");
    }

    [Fact]
    public async Task SubmitRequestAsync_InvalidFileFormat_ShouldThrowArgumentException()
    {
        // Arrange
        var startDate = DateTime.UtcNow.AddDays(1);
        var endDate = DateTime.UtcNow.AddDays(2);
        using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(2);
        _balanceService.GetEmployeeBalanceAsync(_employeeId, startDate.Year, _absenceTypeId)
            .Returns(new LeaveBalanceDto { Remaining = 10 });

        // Act
        var act = () => _sut.SubmitRequestAsync(
            _employeeId,
            _absenceTypeId,
            startDate,
            endDate,
            "Reason",
            fileStream: stream,
            fileName: "test.exe"
        );

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Invalid file format. Only PDF, JPG, and PNG are allowed.");
    }

    [Fact]
    public async Task SubmitRequestAsync_WithDiagnosisAndDoctor_ShouldSaveRequest()
    {
        // Arrange
        var medicalTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(new AbsenceType
        {
            Id = medicalTypeId,
            Name = "Medical",
            RequiresDoctor = true,
            IsActive = true
        });
        await _context.SaveChangesAsync();

        var startDate = DateTime.UtcNow.AddDays(1);
        var endDate = DateTime.UtcNow.AddDays(2);

        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(2);
        _balanceService.GetEmployeeBalanceAsync(_employeeId, startDate.Year, medicalTypeId)
            .Returns(new LeaveBalanceDto { Remaining = 10 });

        // Act
        var result = await _sut.SubmitRequestAsync(
            _employeeId,
            medicalTypeId,
            startDate,
            endDate,
            "Fever",
            diagnosis: "Influenza",
            treatingDoctor: "Dr. Gregory House"
        );

        // Assert
        result.Should().NotBeNull();
        result.Diagnosis.Should().Be("Influenza");
        result.TreatingDoctor.Should().Be("Dr. Gregory House");
    }

    [Fact]
    public async Task ApproveRequestAsync_DirectManager_ShouldApprove()
    {
        var managerId = Guid.NewGuid();
        var employee = await _context.Employees.FindAsync(_employeeId);
        employee!.ManagerId = managerId;
        await _context.SaveChangesAsync();

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = _absenceTypeId,
            StartDate = DateTime.UtcNow.AddDays(5),
            EndDate = DateTime.UtcNow.AddDays(7),
            Status = RequestStatus.Pending,
            Employee = employee,
            RequesterEmployeeId = _employeeId,
        };
        _context.AbsenceRequests.Add(request);

        _context.Employees.Add(
            new Employee
            {
                Id = managerId,
                FullName = "Manager",
                EmployeeCode = "MGR001",
                NationalId = "67890",
                IsActive = true,
            }
        );
        await _context.SaveChangesAsync();

        var result = await _sut.ApproveRequestAsync(request.Id, managerId, "Approved by manager");

        result.Should().NotBeNull();
        result.Id.Should().Be(request.Id);
        result.Status.Should().Be(RequestStatus.Approved);
        request.ApprovalHistories.Should().ContainSingle(h => h.Action == ApprovalAction.Approved);
    }

    [Fact]
    public async Task SubmitRequestAsync_WithSubType_ShouldSaveRequest()
    {
        // Arrange
        var subTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(new AbsenceType
        {
            Id = subTypeId,
            Name = "Maternity",
            ParentId = _absenceTypeId,
            IsActive = true
        });
        await _context.SaveChangesAsync();

        var startDate = DateTime.UtcNow.AddDays(1);
        var endDate = DateTime.UtcNow.AddDays(2);

        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(2);
        _balanceService.GetEmployeeBalanceAsync(_employeeId, startDate.Year, _absenceTypeId)
            .Returns(new LeaveBalanceDto { Remaining = 10 });

        // Act
        var result = await _sut.SubmitRequestAsync(
            _employeeId,
            _absenceTypeId,
            startDate,
            endDate,
            "Reason",
            absenceSubTypeId: subTypeId
        );

        // Assert
        result.Should().NotBeNull();
        result.AbsenceSubTypeId.Should().Be(subTypeId);
    }

    [Fact]
    public async Task SubmitRequestAsync_WithAttachment_ShouldSaveRequest()
    {
        // Arrange
        var medicalTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(new AbsenceType
        {
            Id = medicalTypeId,
            Name = "Medical",
            RequiresAttachment = true,
            IsActive = true
        });

        // Setup configuration for file path
        var tempPath = Path.Combine(Path.GetTempPath(), "LeaveManagementTests_" + Guid.NewGuid().ToString());
        _context.Configurations.Add(new Configuration { Key = "AttachmentBasePath", Value = tempPath });
        
        await _context.SaveChangesAsync();

        var startDate = DateTime.UtcNow.AddDays(1);
        var endDate = DateTime.UtcNow.AddDays(2);
        using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(2);
        _balanceService.GetEmployeeBalanceAsync(_employeeId, startDate.Year, medicalTypeId)
            .Returns(new LeaveBalanceDto { Remaining = 10 });

        // Act
        var result = await _sut.SubmitRequestAsync(
            _employeeId,
            medicalTypeId,
            startDate,
            endDate,
            "Fever",
            fileStream: stream,
            fileName: "test.pdf"
        );

        // Assert
        result.Should().NotBeNull();
        result.Attachments.Should().HaveCount(1);
        result.Attachments.First().FileName.Should().Be("test.pdf");

        // Cleanup
        if (Directory.Exists(tempPath))
        {
            Directory.Delete(tempPath, true);
        }
    }

    [Fact]
    public async Task ApproveRequestAsync_MedicalLeave_ShouldRequireHR()
    {
        var managerId = Guid.NewGuid();
        var hrId = Guid.NewGuid();

        var employee = await _context.Employees.FindAsync(_employeeId);
        employee!.ManagerId = managerId;

        var medicalTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(
            new AbsenceType
            {
                Id = medicalTypeId,
                Name = "Medical",
                RequiresAttachment = true,
                IsActive = true,
            }
        );

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = medicalTypeId,
            StartDate = DateTime.UtcNow.AddDays(5),
            EndDate = DateTime.UtcNow.AddDays(7),
            Status = RequestStatus.Pending,
            Employee = employee,
            RequesterEmployeeId = _employeeId,
        };
        _context.AbsenceRequests.Add(request);

        // HR Employee
        var hrEmployee = new Employee
        {
            Id = hrId,
            FullName = "HR Person",
            EmployeeCode = "HR001",
            NationalId = "99999",
            User = new User { Id = Guid.NewGuid(), Role = UserRole.HRManager },
            IsActive = true,
        };
        _context.Employees.Add(hrEmployee);

        _context.Employees.Add(
            new Employee
            {
                Id = managerId,
                FullName = "Manager",
                EmployeeCode = "MGR002",
                NationalId = "88888",
                IsActive = true,
            }
        );
        await _context.SaveChangesAsync();

        // Manager tries to approve medical leave
        var managerAct = () => _sut.ApproveRequestAsync(request.Id, managerId, "Manager approval");
        await managerAct
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("Medical leaves must be validated and approved by an HR Administrator.");

        // HR approves medical leave
        var hrResult = await _sut.ApproveRequestAsync(request.Id, hrId, "HR approval");
        hrResult.Should().NotBeNull();
        hrResult.Id.Should().Be(request.Id);
        hrResult.Status.Should().Be(RequestStatus.Approved);
    }

    [Fact]
    public async Task ModifyRequestAsync_OnlyFromModificationRequestedState_ShouldSucceed()
    {
        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = _absenceTypeId,
            StartDate = DateTime.UtcNow.AddDays(10),
            EndDate = DateTime.UtcNow.AddDays(12),
            Status = RequestStatus.ModificationRequested,
            TotalDaysRequested = 3,
            RequesterEmployeeId = _employeeId,
        };
        _context.AbsenceRequests.Add(request);
        await _context.SaveChangesAsync();

        var newStart = DateTime.UtcNow.AddDays(15);
        var newEnd = DateTime.UtcNow.AddDays(16);
        _holidayService.CalculateWorkingDaysAsync(newStart, newEnd).Returns(2);
        _balanceService
            .GetEmployeeBalanceAsync(_employeeId, Arg.Any<int>(), _absenceTypeId)
            .Returns(
                new LeaveBalanceDto
                {
                    TotalEntitlement = 10,
                    Taken = 0,
                    Remaining = 10,
                }
            );

        var result = await _sut.ModifyRequestAsync(request.Id, newStart, newEnd, "Updated reason");

        result.Status.Should().Be(RequestStatus.Pending);
        result.Reason.Should().Be("Updated reason");
        result.TotalDaysRequested.Should().Be(2);
    }

    [Fact]
    public async Task RejectRequestAsync_ShouldChangeStatusToRejected()
    {
        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = _absenceTypeId,
            StartDate = DateTime.UtcNow.AddDays(10),
            EndDate = DateTime.UtcNow.AddDays(11),
            Status = RequestStatus.Pending,
            RequesterEmployeeId = _employeeId,
        };
        _context.AbsenceRequests.Add(request);
        await _context.SaveChangesAsync();
        _context.ChangeTracker.Clear();

        var approverId = Guid.NewGuid();
        _context.Employees.Add(
            new Employee
            {
                Id = approverId,
                FullName = "Approver",
                EmployeeCode = "APP001",
                NationalId = "00000",
                IsActive = true,
            }
        );
        await _context.SaveChangesAsync();
        _context.ChangeTracker.Clear();

        var result = await _sut.RejectRequestAsync(request.Id, approverId, "No vacation for you");
        result.Should().NotBeNull();
        result.Id.Should().Be(request.Id);

        _context.ChangeTracker.Clear();
        var reloadedRequest = await _context
            .AbsenceRequests.Include(r => r.ApprovalHistories)
            .FirstOrDefaultAsync(r => r.Id == request.Id);

        reloadedRequest!.Status.Should().Be(RequestStatus.Rejected);
        reloadedRequest
            .ApprovalHistories.Should()
            .ContainSingle(h => h.Action == ApprovalAction.Rejected);
    }

    [Fact]
    public async Task CancelRequestAsync_ShouldChangeStatusToCancelled()
    {
        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = _absenceTypeId,
            StartDate = DateTime.UtcNow.AddDays(10),
            EndDate = DateTime.UtcNow.AddDays(11),
            Status = RequestStatus.Pending,
            RequesterEmployeeId = _employeeId,
        };
        _context.AbsenceRequests.Add(request);
        await _context.SaveChangesAsync();

        var result = await _sut.CancelRequestAsync(request.Id, "Change of plans");

        result.Should().NotBeNull();
        result.Id.Should().Be(request.Id);
        result.Status.Should().Be(RequestStatus.Cancelled);
    }

    [Fact]
    public async Task GetEmployeeRequestsAsync_WithStatusFilter_ShouldReturnOnlyMatchingRequests()
    {
        // Arrange
        var cancelledRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            StartDate = DateTime.UtcNow.AddDays(1),
            EndDate = DateTime.UtcNow.AddDays(2),
            Status = RequestStatus.Cancelled,
            RequesterEmployeeId = _employeeId,
        };
        var approvedRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            StartDate = DateTime.UtcNow.AddDays(3),
            EndDate = DateTime.UtcNow.AddDays(4),
            Status = RequestStatus.Approved,
            RequesterEmployeeId = _employeeId,
        };
        _context.AbsenceRequests.AddRange(cancelledRequest, approvedRequest);
        await _context.SaveChangesAsync();

        var filter = new PaginationFilter { First = 10 };

        // Act
        var result = await _sut.GetEmployeeRequestsAsync(_employeeId, filter, RequestStatus.Cancelled);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items.First().Id.Should().Be(cancelledRequest.Id);
        result.Items.First().Status.Should().Be(RequestStatus.Cancelled);
    }

    [Fact]
    public async Task GetTeamAbsencesAsync_WithStatusFilter_ShouldReturnOnlyMatchingRequests()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var employee = new Employee { Id = Guid.NewGuid(), ManagerId = managerId, EmployeeCode = "E1", NationalId = "N1", FullName = "F1" };
        _context.Employees.Add(employee);

        var pendingRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            Employee = employee,
            StartDate = DateTime.UtcNow.AddDays(1),
            EndDate = DateTime.UtcNow.AddDays(2),
            Status = RequestStatus.Pending,
            RequesterEmployeeId = employee.Id,
        };
        var rejectedRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            Employee = employee,
            StartDate = DateTime.UtcNow.AddDays(3),
            EndDate = DateTime.UtcNow.AddDays(4),
            Status = RequestStatus.Rejected,
            RequesterEmployeeId = employee.Id,
        };
        _context.AbsenceRequests.AddRange(pendingRequest, rejectedRequest);
        await _context.SaveChangesAsync();

        var filter = new PaginationFilter { First = 10 };

        // Act
        var result = await _sut.GetTeamAbsencesAsync(managerId, filter, RequestStatus.Pending);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items.First().Id.Should().Be(pendingRequest.Id);
        result.Items.First().Status.Should().Be(RequestStatus.Pending);
    }
}
