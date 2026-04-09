using System.Collections.Generic;

namespace LeaveManagement.Application.Models.Paging;

/**
 * Generic pagination result.
 */
public class PaginationResult<T>
{
    /**
     * List of items in the current page.
     */
    public ICollection<T> Items { get; set; } = new List<T>();

    /**
     * Indicates if there is a next page.
     */
    public bool HasNextPage { get; set; }

    /**
     * Indicates if there is a previous page.
     */
    public bool HasPreviousPage { get; set; }

    /**
     * The cursor for the first item in the page.
     */
    public string? StartCursor { get; set; }

    /**
     * The cursor for the last item in the page.
     */
    public string? EndCursor { get; set; }

    /**
     * Total count of elements.
     */
    public int? TotalCount { get; set; }
}
