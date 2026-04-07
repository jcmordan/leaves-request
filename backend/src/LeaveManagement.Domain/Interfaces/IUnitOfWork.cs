using System.Threading.Tasks;

namespace LeaveManagement.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    Task<int> CompleteAsync();
}
