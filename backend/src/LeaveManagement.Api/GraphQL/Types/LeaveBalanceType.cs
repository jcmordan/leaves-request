using HotChocolate.Types;
using LeaveManagement.Application.DTOs;

namespace LeaveManagement.Api.GraphQL.Types;

public class LeaveBalanceType : ObjectType<LeaveBalanceDto>
{
    protected override void Configure(IObjectTypeDescriptor<LeaveBalanceDto> descriptor)
    {
        descriptor.Field(t => t.TotalEntitlement).Type<NonNullType<IntType>>();
        descriptor.Field(t => t.Taken).Type<NonNullType<IntType>>();
        descriptor.Field(t => t.Remaining).Type<NonNullType<IntType>>();
        descriptor.Field(t => t.AvailablePercentage).Type<NonNullType<FloatType>>();
    }
}
