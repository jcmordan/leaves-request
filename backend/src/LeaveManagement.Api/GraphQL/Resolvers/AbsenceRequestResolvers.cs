using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HotChocolate;
using LeaveManagement.Api.GraphQL.DataLoaders;
using LeaveManagement.Application.DTOs;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Domain.Entities;

namespace LeaveManagement.Api.GraphQL.Resolvers;

public class AbsenceRequestResolvers
{
    public Task<Employee?> GetRequesterEmployeeAsync(
        [Parent] AbsenceRequest absenceRequest,
        IEmployeeByIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        return dataLoader.LoadAsync(absenceRequest.RequesterEmployeeId, cancellationToken);
    }

    public Task<Employee?> GetEmployeeAsync(
        [Parent] AbsenceRequest absenceRequest,
        IEmployeeByIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        return dataLoader.LoadAsync(absenceRequest.EmployeeId, cancellationToken);
    }

    public Task<AbsenceType?> GetAbsenceTypeAsync(
        [Parent] AbsenceRequest absenceRequest,
        IAbsenceTypeByIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        return dataLoader.LoadAsync(absenceRequest.AbsenceTypeId, cancellationToken);
    }

    public async Task<IEnumerable<Attachment>> GetAttachmentsAsync(
        [Parent] AbsenceRequest absenceRequest,
        IAttachmentsByAbsenceRequestIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        var attachments = await dataLoader.LoadAsync(absenceRequest.Id, cancellationToken);
        return attachments ?? Enumerable.Empty<Attachment>();
    }

    public async Task<IEnumerable<ApprovalHistory>> GetApprovalHistoriesAsync(
        [Parent] AbsenceRequest absenceRequest,
        IApprovalHistoriesByAbsenceRequestIdDataLoader dataLoader,
        CancellationToken cancellationToken
    )
    {
        var histories = await dataLoader.LoadAsync(absenceRequest.Id, cancellationToken);
        return histories ?? Enumerable.Empty<ApprovalHistory>();
    }
}
