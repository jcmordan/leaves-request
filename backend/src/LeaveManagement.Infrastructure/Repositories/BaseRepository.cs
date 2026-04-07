using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;

namespace LeaveManagement.Infrastructure.Repositories;

public class BaseRepository<T> : IBaseRepository<T> where T : class
{
    protected readonly LeaveManagementDbContext Context;
    protected readonly DbSet<T> DbSet;

    public BaseRepository(LeaveManagementDbContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id)
    {
        return await DbSet.FindAsync(id);
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await DbSet.ToListAsync();
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await DbSet.Where(predicate).ToListAsync();
    }

    public async Task AddAsync(T entity)
    {
        await DbSet.AddAsync(entity);
    }

    public void Update(T entity)
    {
        DbSet.Attach(entity);
        Context.Entry(entity).State = EntityState.Modified;
    }

    public void Remove(T entity)
    {
        DbSet.Remove(entity);
    }
}
