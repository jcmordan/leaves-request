using HotChocolate.Types;
using LeaveManagement.Api.GraphQL.Resolvers;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Api.GraphQL.Types;

public class AbsenceRequestType : ObjectType<AbsenceRequest>
{
    protected override void Configure(IObjectTypeDescriptor<AbsenceRequest> descriptor)
    {
        descriptor.Field(t => t.Id).Type<NonNullType<UuidType>>();
        descriptor.Field(t => t.EmployeeId).Type<NonNullType<UuidType>>();
        descriptor.Field(t => t.AbsenceTypeId).Type<NonNullType<UuidType>>();
        descriptor.Field(t => t.StartDate).Type<NonNullType<DateType>>();
        descriptor.Field(t => t.EndDate).Type<NonNullType<DateType>>();
        descriptor
            .Field(t => t.Status)
            .Type<NonNullType<EnumType<LeaveManagement.Domain.Enums.RequestStatus>>>();
        descriptor.Field(t => t.Reason).Type<NonNullType<StringType>>();
        descriptor.Field(t => t.Diagnosis).Type<StringType>();
        descriptor.Field(t => t.TreatingDoctor).Type<StringType>();
        descriptor.Field(t => t.TotalDaysRequested).Type<NonNullType<IntType>>();
        descriptor.Field(t => t.CreatedAt).Type<NonNullType<DateTimeType>>();
        descriptor.Field(t => t.RequesterEmployeeId).Type<NonNullType<UuidType>>();

        descriptor
            .Field(t => t.RequesterEmployee)
            .ResolveWith<AbsenceRequestResolvers>(r =>
                r.GetRequesterEmployeeAsync(default!, default!, default)
            )
            .Name("requesterEmployee");

        descriptor
            .Field(t => t.Employee)
            .ResolveWith<AbsenceRequestResolvers>(r =>
                r.GetEmployeeAsync(default!, default!, default)
            )
            .Name("employee");

        descriptor
            .Field(t => t.AbsenceType)
            .ResolveWith<AbsenceRequestResolvers>(r =>
                r.GetAbsenceTypeAsync(default!, default!, default)
            )
            .Name("absenceType");

        descriptor
            .Field(t => t.AbsenceSubType)
            .ResolveWith<AbsenceRequestResolvers>(r =>
                r.GetAbsenceSubTypeAsync(default!, default!, default)
            )
            .Name("absenceSubType");

        descriptor
            .Field(t => t.Attachments)
            .ResolveWith<AbsenceRequestResolvers>(r =>
                r.GetAttachmentsAsync(default!, default!, default)
            )
            .Name("attachments");

        descriptor
            .Field(t => t.ApprovalHistories)
            .ResolveWith<AbsenceRequestResolvers>(r => r.GetApprovalHistoriesAsync(default!, default!, default!))
            .Description("The approval workflow history for this request.");
    }
}
