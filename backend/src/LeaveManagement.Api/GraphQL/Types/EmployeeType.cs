using HotChocolate.Types;
using LeaveManagement.Api.GraphQL.DataLoaders;
using LeaveManagement.Api.GraphQL.Resolvers;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Api.GraphQL.Types;

public class EmployeeType : ObjectType<Employee>
{
    protected override void Configure(IObjectTypeDescriptor<Employee> descriptor)
    {
        descriptor.Field(t => t.Id).Type<NonNullType<IdType>>();
        descriptor.Field(t => t.FullName).Type<NonNullType<StringType>>();
        descriptor.Field(t => t.Email).Type<StringType>();
        descriptor.Field(t => t.EmployeeCode).Type<NonNullType<StringType>>();
        descriptor.Field(t => t.AN8).Type<NonNullType<StringType>>();
        descriptor.Field(t => t.NationalId).Type<NonNullType<StringType>>();
        descriptor.Field(t => t.HireDate).Type<NonNullType<DateTimeType>>();
        descriptor.Field(t => t.IsActive).Type<NonNullType<BooleanType>>();

        descriptor
            .Field(t => t.Company)
            .ResolveWith<EmployeeResolvers>(r => r.GetCompanyAsync(default!, default!, default))
            .Name("company");

        descriptor
            .Field(t => t.Department)
            .ResolveWith<EmployeeResolvers>(r => r.GetDepartmentAsync(default!, default!, default))
            .Name("department");

        descriptor
            .Field(t => t.DepartmentSection)
            .ResolveWith<EmployeeResolvers>(r =>
                r.GetDepartmentSectionAsync(default!, default!, default)
            )
            .Name("departmentSection");

        descriptor
            .Field(t => t.JobTitle)
            .ResolveWith<EmployeeResolvers>(r => r.GetJobTitleAsync(default!, default!, default))
            .Name("jobTitle");

        descriptor
            .Field("leaveBalance")
            .Type<NonNullType<LeaveBalanceType>>()
            .ResolveWith<EmployeeResolvers>(r =>
                r.GetLeaveBalanceAsync(default!, default!, default)
            )
            .Name("leaveBalance");

        descriptor
            .Field(t => t.Manager)
            .ResolveWith<EmployeeResolvers>(r => r.GetManagerAsync(default!, default!, default))
            .Name("manager");

        descriptor
            .Field(t => t.Subordinates)
            .ResolveWith<EmployeeResolvers>(r =>
                r.GetSubordinatesAsync(default!, default!, default)
            )
            .Name("subordinates");
    }
}
