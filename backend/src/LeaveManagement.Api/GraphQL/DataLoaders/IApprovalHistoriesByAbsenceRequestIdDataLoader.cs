using GreenDonut;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Api.GraphQL.DataLoaders;

public interface IApprovalHistoriesByAbsenceRequestIdDataLoader : IDataLoader<Guid, ApprovalHistory[]> { }
