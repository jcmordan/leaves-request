using System;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Execution;
using HotChocolate.Types;
using LeaveManagement.Api.GraphQL;
using LeaveManagement.Api.GraphQL.Mutations;
using LeaveManagement.Api.GraphQL.Queries;
using LeaveManagement.Api.GraphQL.Types;
using LeaveManagement.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using FluentAssertions;
using NSubstitute;
using LeaveManagement.Domain.Interfaces;

namespace LeaveManagement.UnitTests.GraphQL.Schema;

public class GraphQLSchemaTests
{
    [Fact]
    public async Task Schema_ShouldBuildSuccessfully()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddTransient(_ => Substitute.For<ILeaveRequestService>());
        services.AddTransient(_ => Substitute.For<ICurrentUserService>());
        services.AddTransient(_ => Substitute.For<IBalanceService>());
        services.AddTransient(_ => Substitute.For<IEmployeeService>());
        services.AddTransient(_ => Substitute.For<IDepartmentService>());
        services.AddTransient(_ => Substitute.For<ICompanyService>());

        // Act & Assert
        try
        {
            var schema = await services
                .AddAuthorization()
                .AddGraphQLServer()
                .AddType<UploadType>()
                .AddAuthorization()
                .AddQueryType<Query>()
                .AddTypeExtension<LeaveRequestQueries>()
                .AddMutationType<Mutation>()
                .AddTypeExtension<LeaveRequestMutations>()
                .AddType<EmployeeType>()
                .AddType<AbsenceRequestType>()
                .AddType<AbsenceAnalysisType>()
                .AddType<OverlappingAbsenceType>()
                .AddType<LeaveBalanceType>()
                .BuildSchemaAsync();

            schema.Should().NotBeNull();
            var schemaString = schema.ToString();
            schemaString.Should().Contain("type AbsenceAnalysis");
            schemaString.Should().Contain("type OverlappingAbsence");
            schemaString.Should().Contain("type AbsenceRequest");
        }
        catch (SchemaException ex)
        {
            var errorMessages = new System.Text.StringBuilder();
            foreach (var error in ex.Errors)
            {
                errorMessages.AppendLine(error.Message);
            }
            throw new Exception($"Schema build failed with {ex.Errors.Count} errors:\n{errorMessages}");
        }
    }
}
