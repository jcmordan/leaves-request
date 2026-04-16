using HotChocolate.Types;
using LeaveManagement.Application.DTOs;

namespace LeaveManagement.Api.GraphQL.Types;

public class LeaveRequestSummaryType : ObjectType<LeaveRequestSummary>
{
    protected override void Configure(IObjectTypeDescriptor<LeaveRequestSummary> descriptor)
    {
        descriptor.Name("LeaveRequestSummary");

        descriptor
            .Field(t => t.OverlappingAbsences)
            .Type<NonNullType<ListType<NonNullType<OverlappingAbsenceType>>>>();

        descriptor
            .Field(t => t.TrendData)
            .Type<NonNullType<ListType<NonNullType<ObjectType<LeaveTrendDataPointDto>>>>>()
            .Name("trendData");

        descriptor
            .Field(t => t.PendingCount)
            .Type<NonNullType<IntType>>();

        descriptor
            .Field(t => t.RejectedCount)
            .Type<NonNullType<IntType>>();

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

        descriptor
            .Field(t => t.ApprovedThisMonthCount)
            .Type<NonNullType<IntType>>();

        descriptor
            .Field(t => t.UpcomingMinAvailablePercentage)
            .Type<NonNullType<IntType>>();

        descriptor
            .Field(t => t.UpcomingMinAvailableDate)
            .Type<DateType>();

        descriptor
            .Field(t => t.InsightMessage)
            .Type<StringType>();

        descriptor
            .Field(t => t.AvgResponseTimeHours)
            .Type<FloatType>();
    }
}
