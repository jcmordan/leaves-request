using HotChocolate.Types;
using LeaveManagement.Application.DTOs;

namespace LeaveManagement.Api.GraphQL.Types;

public class OverlappingAbsenceType : ObjectType<OverlappingAbsenceDto>
{
    protected override void Configure(IObjectTypeDescriptor<OverlappingAbsenceDto> descriptor)
    {
        descriptor.Field(t => t.EmployeeName).Type<NonNullType<StringType>>();
        descriptor.Field(t => t.JobTitle).Type<NonNullType<StringType>>();
        descriptor.Field(t => t.StartDate).Type<NonNullType<DateType>>();
        descriptor.Field(t => t.EndDate).Type<NonNullType<DateType>>();
    }
}
