using System.Threading.Tasks;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;

namespace LeaveManagement.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly LeaveManagementDbContext _context;

    public UnitOfWork(LeaveManagementDbContext context)
    {
        _context = context;
    }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
