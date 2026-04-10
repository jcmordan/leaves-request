using Microsoft.EntityFrameworkCore;
using LeaveManagement.Infrastructure.Data;

namespace LeaveManagement.Infrastructure.Tests.Helpers;

public static class TestDbContextFactory
{
    public static LeaveManagementDbContext Create()
    {
        var options = new DbContextOptionsBuilder<LeaveManagementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new LeaveManagementDbContext(options);
        context.Database.EnsureCreated();

        return context;
    }
}
