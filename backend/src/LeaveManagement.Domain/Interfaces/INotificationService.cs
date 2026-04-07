using System;
using System.Threading.Tasks;

namespace LeaveManagement.Domain.Interfaces;

public interface INotificationService
{
    Task SendNotificationAsync(Guid employeeId, string message, string? link = null);
}
