using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using LeaveManagement.Application.Models.Paging;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Application.Common.Paging;

/**
 * Helper class for applying pagination to IQueryable.
 */
public static class PagingHelper
{
    /**
     * Applies Relay-style keyset pagination to an IQueryable.
     */
    public static async Task<PaginationResult<T>> ApplyPagingAsync<T>(
        IQueryable<T> query,
        PaginationFilter filter
    )
    {
        // For keyset pagination, we need a stable sort key. We'll use "Id" by default.
        // This helper assumes T has a Guid Id property (typical for this project).
        
        var first = filter.First ?? 10;
        var after = filter.After;

        IQueryable<T> paginatedQuery = query;

        // Create an expression for the "Id" property: item => item.Id
        var idSelector = CreateIdSelector<T>();
        var idGetter = idSelector.Compile();

        // Apply Keyset filtering if 'after' cursor is provided
        if (!string.IsNullOrEmpty(after))
        {
            var afterId = DecodeCursorToGuid(after);

            // Build: item => item.Id > afterId
            var parameter = idSelector.Parameters[0];
            var body = Expression.GreaterThan(idSelector.Body, Expression.Constant(afterId));
            var predicate = Expression.Lambda<Func<T, bool>>(body, parameter);

            paginatedQuery = paginatedQuery.Where(predicate);
        }

        // Always order by Id for stable keyset pagination
        paginatedQuery = paginatedQuery.OrderBy(idSelector);

        // Get one more than requested to determine if there's a next page
        var items = await paginatedQuery.Take(first + 1).ToListAsync();

        var hasNextPage = items.Count > first;
        if (hasNextPage)
        {
            items.RemoveAt(items.Count - 1);
        }

        var resultItems = items.ToList();
        var startCursor = resultItems.Count > 0 ? EncodeGuidToCursor(idGetter(resultItems.First())) : null;
        var endCursor = resultItems.Count > 0 ? EncodeGuidToCursor(idGetter(resultItems.Last())) : null;

        return new PaginationResult<T>
        {
            Items = resultItems,
            HasNextPage = hasNextPage,
            HasPreviousPage = !string.IsNullOrEmpty(after), // Simple assumption for keyset
            StartCursor = startCursor,
            EndCursor = endCursor,
            TotalCount = await query.CountAsync()
        };
    }

    private static string EncodeGuidToCursor(Guid id) =>
        Convert.ToBase64String(id.ToByteArray());

    private static Guid DecodeCursorToGuid(string cursor) =>
        new Guid(Convert.FromBase64String(cursor));

    private static Expression<Func<T, Guid>> CreateIdSelector<T>()
    {
        var parameter = Expression.Parameter(typeof(T), "item");
        var property = Expression.Property(parameter, "Id");

        // Ensure the property is Guid. If it's something else, this will throw a more helpful error here.
        if (property.Type != typeof(Guid))
        {
            throw new InvalidOperationException($"The 'Id' property on {typeof(T).Name} must be of type Guid.");
        }

        return Expression.Lambda<Func<T, Guid>>(property, parameter);
    }
}
