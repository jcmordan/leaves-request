using HotChocolate.Types;
using LeaveManagement.Application.DTOs;

namespace LeaveManagement.Api.GraphQL.Types;

public class AbsenceAnalysisType : ObjectType<AbsenceAnalysisDto>
{
    protected override void Configure(IObjectTypeDescriptor<AbsenceAnalysisDto> descriptor)
    {
        descriptor
            .Field(t => t.OverlappingAbsences)
            .Type<NonNullType<ListType<NonNullType<OverlappingAbsenceType>>>>();

        descriptor
            .Field(t => t.AvailablePercentage)
            .Type<NonNullType<IntType>>();

        descriptor
            .Field(t => t.TotalTeamMembers)
            .Type<NonNullType<IntType>>();

        descriptor
            .Field(t => t.MembersOnLeave)
            .Type<NonNullType<IntType>>();

        descriptor
            .Field(t => t.PendingMembersOnLeave)
            .Type<NonNullType<IntType>>();
    }
}
