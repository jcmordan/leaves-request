using GreenDonut;
using LeaveManagement.Application.DTOs;

namespace LeaveManagement.Api.GraphQL.DataLoaders;

public interface ILeaveBalanceDataLoader : IDataLoader<Guid, LeaveBalanceDto?> { }
