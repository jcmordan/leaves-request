using GreenDonut;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Api.GraphQL.DataLoaders;

public interface IEmployeeByIdDataLoader : IDataLoader<Guid, Employee?> { }
