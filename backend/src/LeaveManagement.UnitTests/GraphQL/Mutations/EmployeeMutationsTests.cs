using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using LeaveManagement.Api.GraphQL.InputTypes;
using LeaveManagement.Api.GraphQL.Mutations;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;
using LeaveManagement.Domain.Models;
using NSubstitute;
using Xunit;

namespace LeaveManagement.UnitTests.GraphQL.Mutations;

public class EmployeeMutationsTests
{
    private readonly IEmployeeService _employeeService;
    private readonly EmployeeMutations _sut;

    public EmployeeMutationsTests()
    {
        _employeeService = Substitute.For<IEmployeeService>();
        _sut = new EmployeeMutations();
    }

    [Fact]
    public async Task CreateEmployee_ShouldCallServiceWithCorrectParameters()
    {
        // Arrange
        var input = new CreateEmployeeInput(
            "Test Employee",
            "test@example.com",
            "EMP001",
            "NID001",
            Guid.NewGuid(),
            DateOnly.FromDateTime(DateTime.UtcNow)
        );
        var expectedEmployee = new Employee { Id = Guid.NewGuid(), FullName = input.FullName };
        _employeeService.CreateAsync(
            input.FullName,
            input.Email,
            input.EmployeeCode,
            input.NationalId,
            input.DepartmentId,
            input.HireDate,
            Arg.Any<CancellationToken>()
        ).Returns(expectedEmployee);

        // Act
        var result = await _sut.CreateEmployee(_employeeService, input, CancellationToken.None);

        // Assert
        result.Should().Be(expectedEmployee);
        await _employeeService.Received(1).CreateAsync(
            input.FullName,
            input.Email,
            input.EmployeeCode,
            input.NationalId,
            input.DepartmentId,
            input.HireDate,
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task UpdateEmployee_ShouldCallServiceWithMappedData()
    {
        // Arrange
        var input = new UpdateEmployeeInput(
            Id: Guid.NewGuid(),
            FullName: "Updated Name",
            Email: "updated@example.com",
            EmployeeCode: "EMP002",
            NationalId: "NID002",
            DepartmentId: Guid.NewGuid(),
            HireDate: DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive: true,
            An8: "AN8-789",
            JobTitleId: Guid.NewGuid(),
            DepartmentSectionId: Guid.NewGuid(),
            CompanyId: Guid.NewGuid(),
            ManagerId: Guid.NewGuid()
        );
        var expectedEmployee = new Employee { Id = input.Id, FullName = input.FullName };
        
        _employeeService.UpdateAsync(
            Arg.Any<EmployeeUpdateData>(),
            Arg.Any<CancellationToken>()
        ).Returns(expectedEmployee);

        // Act
        var result = await _sut.UpdateEmployee(_employeeService, input, CancellationToken.None);

        // Assert
        result.Should().Be(expectedEmployee);
        await _employeeService.Received(1).UpdateAsync(
            Arg.Is<EmployeeUpdateData>(d => 
                d.Id == input.Id &&
                d.FullName == input.FullName &&
                d.Email == input.Email &&
                d.EmployeeCode == input.EmployeeCode &&
                d.NationalId == input.NationalId &&
                d.AN8 == input.An8
            ),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task DeactivateEmployee_ShouldCallService()
    {
        // Arrange
        var id = Guid.NewGuid();
        _employeeService.DeactivateAsync(id, Arg.Any<CancellationToken>()).Returns(true);

        // Act
        var result = await _sut.DeactivateEmployee(_employeeService, id, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        await _employeeService.Received(1).DeactivateAsync(id, Arg.Any<CancellationToken>());
    }
}
