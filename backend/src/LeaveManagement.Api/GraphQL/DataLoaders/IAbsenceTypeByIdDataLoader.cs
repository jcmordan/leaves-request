using GreenDonut;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Api.GraphQL.DataLoaders;

public interface IAbsenceTypeByIdDataLoader : IDataLoader<Guid, AbsenceType?> { }
