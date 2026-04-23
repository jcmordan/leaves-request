using FluentAssertions;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Services;
using LeaveManagement.Application.Tests.Helpers;
using LeaveManagement.Application.Models.Paging;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Enums;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace LeaveManagement.Application.Tests.Services;

public class LeaveRequestServiceTests : IDisposable
{
    private readonly LeaveManagementDbContext _context;
    private readonly IHolidayService _holidayService;
    private readonly IBalanceService _balanceService;
    private readonly ICurrentUserService _currentUserService;
    private readonly LeaveRequestService _sut;
    private readonly Guid _employeeId = Guid.NewGuid();
    private readonly Guid _absenceTypeId = Guid.NewGuid();

    public LeaveRequestServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _holidayService = Substitute.For<IHolidayService>();
        _balanceService = Substitute.For<IBalanceService>();
        _currentUserService = Substitute.For<ICurrentUserService>();
        _sut = new LeaveRequestService(_context, _holidayService, _balanceService, _currentUserService);

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
                HireDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-1)),
                IsActive = true,
            }
        );

        _context.SaveChanges();
    }

    [Fact]
    public async Task SubmitRequestAsync_StartDateInPast_ShouldSaveRequest()
    {
        // Arrange
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow);
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
                DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
                DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
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
                DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
                DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
                "Reason"
            );

        await act.Should().ThrowAsync<Exception>().WithMessage("Absence type not found.");
    }

    [Fact]
    public async Task SubmitRequestAsync_InsufficientBalance_ShouldThrowException()
    {
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5));

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
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(12));

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
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));

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

        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));

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

        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));

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
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));
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

        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));

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
    public async Task GetAbsenceAnalysisAsync_ValidRequest_ShouldReturnSummary()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var employee = await _context.Employees.FindAsync(_employeeId);
        employee!.ManagerId = managerId;

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = _absenceTypeId,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            Status = RequestStatus.Pending,
            Employee = employee,
            RequesterEmployeeId = _employeeId,
        };
        _context.AbsenceRequests.Add(request);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetAbsenceAnalysisAsync(request.Id, managerId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<LeaveRequestSummary>();
        result.TotalTeamMembers.Should().Be(1);
    }

    [Fact]
    public async Task GetApprovalsDashboardSummaryAsync_ShouldReturnMetrics()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        
        var employee1 = new Employee { Id = Guid.NewGuid(), ManagerId = managerId, FullName = "Emp 1", EmployeeCode = "E1", NationalId = "N1", IsActive = true };
        var employee2 = new Employee { Id = Guid.NewGuid(), ManagerId = managerId, FullName = "Emp 2", EmployeeCode = "E2", NationalId = "N2", IsActive = true };
        _context.Employees.AddRange(employee1, employee2);

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee1.Id,
            AbsenceTypeId = _absenceTypeId,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            Status = RequestStatus.Approved,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            RequesterEmployeeId = employee1.Id
        };
        
        var pendingRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee2.Id,
            AbsenceTypeId = _absenceTypeId,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(11)),
            Status = RequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            RequesterEmployeeId = employee2.Id
        };

        var history = new ApprovalHistory
        {
            Id = Guid.NewGuid(),
            AbsenceRequestId = request.Id,
            Action = ApprovalAction.Approved,
            ActionDate = DateTime.UtcNow.AddDays(-1),
            ApproverEmployeeId = managerId
        };

        _context.AbsenceRequests.AddRange(request, pendingRequest);
        _context.ApprovalHistories.Add(history);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetApprovalsDashboardSummaryAsync(managerId);

        // Assert
        result.Should().NotBeNull();
        result.PendingCount.Should().Be(1);
        result.TotalTeamMembers.Should().Be(2);
        result.MembersOnLeave.Should().Be(1); // request is for Today
        result.AvgResponseTimeHours.Should().BeInRange(23.9, 24.1); // Created -2, Action -1 = 24h
        result.TrendData.Should().HaveCount(7);
    }

    [Fact]
    public async Task GetAbsenceAnalysisAsync_WithOverlaps_ShouldIdentifyOverlappingRequests()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var employee1 = await _context.Employees.FindAsync(_employeeId);
        employee1!.ManagerId = managerId;

        var employee2 = new Employee { Id = Guid.NewGuid(), ManagerId = managerId, FullName = "Other Emp", EmployeeCode = "E2", NationalId = "N2", IsActive = true };
        _context.Employees.Add(employee2);

        // Requested absence: Next week Mon-Wed
        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = _absenceTypeId,
            StartDate = new DateOnly(2026, 4, 20),
            EndDate = new DateOnly(2026, 4, 22),
            Status = RequestStatus.Pending,
            RequesterEmployeeId = _employeeId
        };

        // Overlapping absence: Next week Tue-Thu
        var overlap = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee2.Id,
            AbsenceTypeId = _absenceTypeId,
            StartDate = new DateOnly(2026, 4, 21),
            EndDate = new DateOnly(2026, 4, 23),
            Status = RequestStatus.Approved,
            RequesterEmployeeId = employee2.Id
        };

        _context.AbsenceRequests.AddRange(request, overlap);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetAbsenceAnalysisAsync(request.Id, managerId);

        result.AvailablePercentage.Should().Be(50); // 1 out of 2 members available
    }

    [Fact]
    public async Task GetAbsenceAnalysisAsync_RequestNotFound_ShouldThrowException()
    {
        // Act & Assert
        await _sut.Invoking(s => s.GetAbsenceAnalysisAsync(Guid.NewGuid(), Guid.NewGuid()))
            .Should().ThrowAsync<Exception>()
            .WithMessage("Request not found.");
    }

    [Fact]
    public async Task GetApprovalsDashboardSummaryAsync_WithNoTeam_ShouldReturnEmptyMetrics()
    {
        // Act
        var result = await _sut.GetApprovalsDashboardSummaryAsync(Guid.NewGuid());

        // Assert
        result.TotalTeamMembers.Should().Be(0);
        result.AvailablePercentage.Should().Be(100); // Default for no members
        result.InsightMessage.Should().BeNull();
    }

    [Fact]
    public async Task GetApprovalsDashboardSummaryAsync_WithInsight_ShouldReturnCorrectMessage()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var employee = new Employee { Id = Guid.NewGuid(), ManagerId = managerId, FullName = "Emp 1", EmployeeCode = "E1", NationalId = "N1", IsActive = true };
        _context.Employees.Add(employee);

        // Many pending requests (trigger insight)
        for (int i = 0; i < 6; i++)
        {
            _context.AbsenceRequests.Add(new AbsenceRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = employee.Id,
                AbsenceTypeId = _absenceTypeId,
                Status = RequestStatus.Pending,
                RequesterEmployeeId = employee.Id,
                StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1))
            });
        }
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetApprovalsDashboardSummaryAsync(managerId);

        // Assert
        result.InsightMessage.Should().NotBeNullOrEmpty();
        result.InsightMessage.Should().Contain("pending");
    }

    [Fact]
    public async Task GetApprovalsDashboardSummaryAsync_WithLowCapacity_ShouldReturnCapacityAlert()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var employee = new Employee { Id = Guid.NewGuid(), ManagerId = managerId, FullName = "Emp 1", EmployeeCode = "E1", NationalId = "N1", IsActive = true };
        _context.Employees.Add(employee);

        // Add 1 approved request (100% leave for 1 person = 0% capacity)
        _context.AbsenceRequests.Add(new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            AbsenceTypeId = _absenceTypeId,
            Status = RequestStatus.Approved,
            RequesterEmployeeId = employee.Id,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1))
        });
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetApprovalsDashboardSummaryAsync(managerId);

        // Assert
        result.InsightMessage.Should().NotBeNullOrEmpty();
        result.InsightMessage.Should().Contain("Critical Capacity Alert");
    }

    [Fact]
    public async Task GetApprovalsDashboardSummaryAsync_WithPendingRisk_ShouldReturnRiskWarning()
    {
        // Arrange
        // 10 employees, 3 pending requests (70% capacity risk)
        var managerId = Guid.NewGuid();
        for (int i = 0; i < 10; i++)
        {
            var emp = new Employee { Id = Guid.NewGuid(), ManagerId = managerId, FullName = $"Emp {i}", EmployeeCode = $"E{i}", NationalId = $"N{i}", IsActive = true };
            _context.Employees.Add(emp);
            
            if (i < 4)
            {
                _context.AbsenceRequests.Add(new AbsenceRequest
                {
                    Id = Guid.NewGuid(),
                    EmployeeId = emp.Id,
                    AbsenceTypeId = _absenceTypeId,
                    Status = RequestStatus.Pending,
                    RequesterEmployeeId = emp.Id,
                    StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1))
                });
            }
        }
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetApprovalsDashboardSummaryAsync(managerId);

        // Assert
        result.InsightMessage.Should().NotBeNullOrEmpty();
        result.InsightMessage.Should().Contain("drop team capacity below 70%");
    }

    [Fact]
    public async Task GetApprovalsDashboardSummaryAsync_CrossingYearLimit_ShouldFilterCorrectDays()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var employee = new Employee { Id = Guid.NewGuid(), ManagerId = managerId, FullName = "Emp 1", EmployeeCode = "E1", NationalId = "N1", IsActive = true };
        _context.Employees.Add(employee);

        // Request spanning Year boundary (Dec 30 to Jan 2)
        var referenceYear = 2026;
        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            AbsenceTypeId = _absenceTypeId,
            Status = RequestStatus.Approved,
            RequesterEmployeeId = employee.Id,
            StartDate = new DateOnly(referenceYear, 12, 30),
            EndDate = new DateOnly(referenceYear + 1, 1, 2)
        };
        _context.AbsenceRequests.Add(request);
        await _context.SaveChangesAsync();

        // Act - Reference date is Dec 31st
        var result = await _sut.GetApprovalsDashboardSummaryAsync(managerId, new DateOnly(referenceYear, 12, 31));

        // Assert
        // Should only count Dec 30 & Dec 31 in current year trend (2 days)
        // Total count across all days in trend data should reflect these 2 days
        result.TrendData.Sum(d => d.Count).Should().Be(2); 
    }

    [Fact]
    public async Task GetApprovalsDashboardSummaryAsync_WithSundayData_ShouldSortCorrectly()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var employee = new Employee { Id = Guid.NewGuid(), ManagerId = managerId, FullName = "Emp 1", EmployeeCode = "E1", NationalId = "N1", IsActive = true };
        _context.Employees.Add(employee);

        // A Sunday (2026-04-12)
        var sunday = new DateOnly(2026, 4, 12);
        _context.AbsenceRequests.Add(new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            AbsenceTypeId = _absenceTypeId,
            Status = RequestStatus.Approved,
            StartDate = sunday,
            EndDate = sunday,
            RequesterEmployeeId = employee.Id
        });
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetApprovalsDashboardSummaryAsync(managerId, sunday);

        // Assert
        result.TrendData.Last().Label.Should().Be("Sun");
        result.TrendData.Last().Count.Should().Be(1);
    }

    [Fact]
    public async Task ApproveRequestAsync_DirectManager_ShouldApprove()
    {
        var managerId = Guid.NewGuid();
        var employee = await _context.Employees.FindAsync(_employeeId);
        employee!.ManagerId = managerId;

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = _absenceTypeId,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
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

        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));

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

        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));
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
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
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
            User = new User { Id = Guid.NewGuid(), Roles = new List<UserRole> { UserRole.HRManager } },
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
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(12)),
            Status = RequestStatus.ModificationRequested,
            TotalDaysRequested = 3,
            RequesterEmployeeId = _employeeId,
        };
        _context.AbsenceRequests.Add(request);
        await _context.SaveChangesAsync();

        var newStart = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(15));
        var newEnd = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(16));
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
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(11)),
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
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(11)),
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
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
            Status = RequestStatus.Cancelled,
            RequesterEmployeeId = _employeeId,
        };
        var approvedRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(4)),
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
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
            Status = RequestStatus.Pending,
            RequesterEmployeeId = employee.Id,
        };
        var rejectedRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            Employee = employee,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(4)),
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

    [Fact]
    public async Task GetByIdAsync_WithValidId_ShouldReturnRequest()
    {
        // Arrange
        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = _absenceTypeId,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(11)),
            Status = RequestStatus.Pending,
            RequesterEmployeeId = _employeeId,
            Reason = "Valid ID test"
        };
        _context.AbsenceRequests.Add(request);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetByIdAsync(request.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(request.Id);
        result.Reason.Should().Be("Valid ID test");
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        // Act
        var result = await _sut.GetByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task SubmitRequestAsync_CalendarDays_ShouldCalculateCorrectly()
    {
        // Arrange
        var calendarTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(new AbsenceType
        {
            Id = calendarTypeId,
            Name = "Calendar Days Type",
            CalculationType = CalculationType.CalendarDays,
            IsActive = true
        });
        await _context.SaveChangesAsync();

        var startDate = new DateOnly(2026, 1, 1); // Thursday
        var endDate = new DateOnly(2026, 1, 4);   // Sunday (4 days total)

        _balanceService.GetEmployeeBalanceAsync(_employeeId, startDate.Year, calendarTypeId)
            .Returns(new LeaveBalanceDto { Remaining = 10 });

        // Act
        var result = await _sut.SubmitRequestAsync(_employeeId, calendarTypeId, startDate, endDate, "Test");

        // Assert
        result.TotalDaysRequested.Should().Be(4);
    }

    [Fact]
    public async Task SubmitRequestAsync_ExceedsMaxDays_ShouldThrowException()
    {
        // Arrange
        var maxDaysTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(new AbsenceType
        {
            Id = maxDaysTypeId,
            Name = "Limited Type",
            MaxDaysPerYear = 5,
            IsActive = true
        });
        await _context.SaveChangesAsync();

        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10));
        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(8);

        // Act
        var act = () => _sut.SubmitRequestAsync(_employeeId, maxDaysTypeId, startDate, endDate, "Test");

        // Assert
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("*exceed the maximum of 5 days*");
    }

    [Fact]
    public async Task SubmitRequestAsync_ZeroDays_ShouldThrowException()
    {
        // Arrange
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        _holidayService.CalculateWorkingDaysAsync(startDate, endDate).Returns(0);

        // Act
        var act = () => _sut.SubmitRequestAsync(_employeeId, _absenceTypeId, startDate, endDate, "Test");

        // Assert
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("The selected dates do not result in any days.");
    }

    [Fact]
    public async Task RequestModificationAsync_ValidId_ShouldUpdateStatus()
    {
        // Arrange
        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            Status = RequestStatus.Pending,
            RequesterEmployeeId = _employeeId
        };
        _context.AbsenceRequests.Add(request);
        await _context.SaveChangesAsync();
        var approverId = Guid.NewGuid();

        // Act
        var result = await _sut.RequestModificationAsync(request.Id, approverId, "Need more info");

        // Assert
        result.Status.Should().Be(RequestStatus.ModificationRequested);
    }

    [Fact]
    public async Task ApproveRequestAsync_NotPending_ShouldThrowException()
    {
        // Arrange
        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = _absenceTypeId,
            Status = RequestStatus.Approved,
            RequesterEmployeeId = _employeeId,
            CreatedAt = DateTime.UtcNow
        };
        _context.AbsenceRequests.Add(request);

        var approverId = Guid.NewGuid();
        _context.Employees.Add(new Employee { Id = approverId, FullName = "Approver", EmployeeCode = "A1", NationalId = "N1", IsActive = true, HireDate = DateOnly.FromDateTime(DateTime.UtcNow) });
        
        await _context.SaveChangesAsync();

        // Act
        var act = () => _sut.ApproveRequestAsync(request.Id, approverId, "Approved");

        // Assert
        await act.Should().ThrowAsync<Exception>().WithMessage("Only pending requests can be approved.");
    }

    [Fact]
    public async Task ApproveRequestAsync_NonManager_ShouldThrowException()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var employee = await _context.Employees.FindAsync(_employeeId);
        employee!.ManagerId = managerId;
        await _context.SaveChangesAsync();

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = _absenceTypeId,
            Status = RequestStatus.Pending,
            Employee = employee,
            RequesterEmployeeId = _employeeId,
            CreatedAt = DateTime.UtcNow
        };
        _context.AbsenceRequests.Add(request);

        var otherPersonId = Guid.NewGuid();
        _context.Employees.Add(new Employee { Id = otherPersonId, FullName = "Other", EmployeeCode = "O1", NationalId = "NO1", IsActive = true, HireDate = DateOnly.FromDateTime(DateTime.UtcNow) });

        await _context.SaveChangesAsync();

        // Act
        var act = () => _sut.ApproveRequestAsync(request.Id, otherPersonId, "Random person approving");

        // Assert
        await act.Should().ThrowAsync<Exception>().WithMessage("Only the direct manager can approve this request.");
    }

    [Fact]
    public async Task GetAbsenceRequestsAsync_WithFilter_ShouldReturnResults()
    {
        // Arrange
        var filter = new PaginationFilter { First = 10 };
        
        // Act
        var result = await _sut.GetAbsenceRequestsAsync(filter, RequestStatus.Pending);

        // Assert
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task GetAbsenceAnalysisAsync_ShouldReturnCorrectData_WhenOverlapsExist()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var employee = await _context.Employees.FindAsync(_employeeId);
        employee!.ManagerId = managerId;
        
        var otherEmployee = new Employee 
        { 
            Id = Guid.NewGuid(), 
            FullName = "Other Employee", 
            ManagerId = managerId, 
            IsActive = true,
            EmployeeCode = "E2",
            NationalId = "N2"
        };
        _context.Employees.Add(otherEmployee);

        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5));

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            StartDate = startDate,
            EndDate = endDate,
            Status = RequestStatus.Pending,
            RequesterEmployeeId = _employeeId
        };
        _context.AbsenceRequests.Add(request);

        var overlappingRequest = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = otherEmployee.Id,
            Employee = otherEmployee,
            StartDate = startDate.AddDays(1),
            EndDate = endDate.AddDays(-1),
            Status = RequestStatus.Approved,
            RequesterEmployeeId = otherEmployee.Id
        };
        _context.AbsenceRequests.Add(overlappingRequest);

        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetAbsenceAnalysisAsync(request.Id, managerId);

        // Assert
        result.Should().NotBeNull();
        result.OverlappingAbsences.Should().HaveCount(1);
        result.OverlappingAbsences.First().EmployeeName.Should().Be("Other Employee");
        result.TotalTeamMembers.Should().Be(2);
        result.MembersOnLeave.Should().Be(1);
        result.AvailablePercentage.Should().Be(50);
    }

    [Fact]
    public async Task GetAbsenceAnalysisAsync_ShouldHandlePendingAndApprovedSeparately()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var employee = await _context.Employees.FindAsync(_employeeId);
        employee!.ManagerId = managerId;
        
        // 3 team members total (including current)
        _context.Employees.AddRange(
            new Employee { Id = Guid.NewGuid(), FullName = "E1", ManagerId = managerId, IsActive = true, EmployeeCode = "E1", NationalId = "N1" },
            new Employee { Id = Guid.NewGuid(), FullName = "E2", ManagerId = managerId, IsActive = true, EmployeeCode = "E2", NationalId = "N2" }
        );

        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5));

        var request = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            Employee = employee,
            StartDate = startDate,
            EndDate = endDate,
            Status = RequestStatus.Pending,
            RequesterEmployeeId = _employeeId
        };
        _context.AbsenceRequests.Add(request);

        // One Approved (associated with an employee in the same team)
        var empApproved = new Employee { Id = Guid.NewGuid(), FullName = "Emp Approved", ManagerId = managerId, IsActive = true, EmployeeCode = "E3", NationalId = "N3" };
        _context.Employees.Add(empApproved);
        var approvedReq = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = empApproved.Id,
            Employee = empApproved,
            StartDate = startDate,
            EndDate = endDate,
            Status = RequestStatus.Approved
        };

        // One Pending (associated with an employee in the same team)
        var empPending = new Employee { Id = Guid.NewGuid(), FullName = "Emp Pending", ManagerId = managerId, IsActive = true, EmployeeCode = "E4", NationalId = "N4" };
        _context.Employees.Add(empPending);
        var pendingReq = new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = empPending.Id,
            Employee = empPending,
            StartDate = startDate,
            EndDate = endDate,
            Status = RequestStatus.Pending
        };
        
        _context.AbsenceRequests.AddRange(approvedReq, pendingReq);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetAbsenceAnalysisAsync(request.Id, managerId);

        // Assert
        result.TotalTeamMembers.Should().Be(5); // 1 (default) + 2 (added first) + 2 (added for reqs) = 5
        result.MembersOnLeave.Should().Be(1); // Approved
        result.PendingMembersOnLeave.Should().Be(2); // Pending (including the current request)
    }

    [Fact]
    public async Task SubmitRequestAsync_SellingType_ShouldEnforceMaxSellableLimit()
    {
        // Arrange
        var sellingTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(
            new AbsenceType
            {
                Id = sellingTypeId,
                Name = "Sell Vacation",
                IsSellingType = true,
                MaxSellableDaysPerYear = 10,
                IsActive = true,
                DeductsFromBalance = true,
            }
        );
        await _context.SaveChangesAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        
        // Mock 11 days calculation
        _holidayService.CalculateWorkingDaysAsync(today, today.AddDays(10)).Returns(11);

        // Act
        var act = () =>
            _sut.SubmitRequestAsync(
                _employeeId,
                sellingTypeId,
                today,
                today.AddDays(10), // Resulting in 11 days
                "Selling 11 days"
            );

        // Assert
        await act.Should()
            .ThrowAsync<Exception>()
            .WithMessage("The requested 11 days to sell exceed the maximum of 10 days allowed per year.");
    }

    [Fact]
    public async Task SubmitRequestAsync_SellingType_ShouldSkipOverlapCheck()
    {
        // Arrange
        var sellingTypeId = Guid.NewGuid();
        _context.AbsenceTypes.Add(
            new AbsenceType
            {
                Id = sellingTypeId,
                Name = "Sell Vacation",
                IsSellingType = true,
                IsActive = true,
                DeductsFromBalance = true,
            }
        );

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Existing approved vacation on the same day
        _context.AbsenceRequests.Add(
            new AbsenceRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = _employeeId,
                AbsenceTypeId = _absenceTypeId,
                StartDate = today,
                EndDate = today,
                Status = RequestStatus.Approved,
                RequesterEmployeeId = _employeeId,
            }
        );
        await _context.SaveChangesAsync();

        _holidayService.CalculateWorkingDaysAsync(today, today).Returns(2); // Just any number

        _balanceService
            .GetEmployeeBalanceAsync(_employeeId, today.Year, sellingTypeId)
            .Returns(new LeaveBalanceDto { Remaining = 10 });

        // Act
        var result = await _sut.SubmitRequestAsync(
            _employeeId,
            sellingTypeId,
            today,
            today,
            "Selling vacation on same day as taking it"
        );

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be(RequestStatus.Pending);
    }

    [Fact]
    public async Task SubmitRequestAsync_NormalRequest_ShouldNotBeBlockedByExistingSellingSubTypeRequest()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var sellingSubTypeId = Guid.NewGuid();
        
        // 1. Create a selling sub-type
        _context.AbsenceTypes.Add(new AbsenceType
        {
            Id = sellingSubTypeId,
            ParentId = _absenceTypeId,
            Name = "Selling SubType",
            IsSellingType = true,
            IsActive = true
        });

        // 2. Add an existing selling sub-type request for "today"
        _context.AbsenceRequests.Add(new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = _absenceTypeId,
            AbsenceSubTypeId = sellingSubTypeId,
            StartDate = today,
            EndDate = today,
            Status = RequestStatus.Approved,
            TotalDaysRequested = 1,
            RequesterEmployeeId = _employeeId
        });
        await _context.SaveChangesAsync();

        _holidayService.CalculateWorkingDaysAsync(today, today).Returns(1);
        _balanceService.GetEmployeeBalanceAsync(_employeeId, today.Year, _absenceTypeId)
            .Returns(new LeaveBalanceDto { Remaining = 10 });

        // Act - Submit a NORMAL request for the SAME day
        var result = await _sut.SubmitRequestAsync(
            _employeeId,
            _absenceTypeId,
            today,
            today,
            "Normal request on same day as selling"
        );

        // Assert - Should NOT be blocked by the selling request
        result.Should().NotBeNull();
        result.Status.Should().Be(RequestStatus.Pending);
    }

    [Fact]
    public async Task SubmitRequestAsync_SellingSubTypeRequest_ShouldNotBeBlockedByExistingNormalRequest()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var sellingSubTypeId = Guid.NewGuid();

        _context.AbsenceTypes.Add(new AbsenceType
        {
            Id = sellingSubTypeId,
            ParentId = _absenceTypeId,
            Name = "Selling SubType",
            IsSellingType = true,
            IsActive = true
        });

        // 1. Existing normal request for today
        _context.AbsenceRequests.Add(new AbsenceRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = _employeeId,
            AbsenceTypeId = _absenceTypeId,
            StartDate = today,
            EndDate = today,
            Status = RequestStatus.Approved,
            TotalDaysRequested = 1,
            RequesterEmployeeId = _employeeId
        });
        await _context.SaveChangesAsync();

        _holidayService.CalculateWorkingDaysAsync(today, today).Returns(1);
        _balanceService.GetEmployeeBalanceAsync(_employeeId, today.Year, _absenceTypeId)
            .Returns(new LeaveBalanceDto { Remaining = 10 });

        // Act - Submit a SELLING sub-type request for the SAME day
        var result = await _sut.SubmitRequestAsync(
            _employeeId,
            _absenceTypeId,
            today,
            today,
            "Selling request on same day as vacation",
            absenceSubTypeId: sellingSubTypeId
        );

        // Assert - Should NOT be blocked
        result.Should().NotBeNull();
        result.Status.Should().Be(RequestStatus.Pending);
        result.AbsenceSubTypeId.Should().Be(sellingSubTypeId);
    }
}