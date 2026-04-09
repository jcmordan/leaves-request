namespace LeaveManagement.Application.Models.Paging;

/**
 * Standard Relay pagination arguments.
 */
public class PaginationFilter
{
    public PaginationFilter() { }

    public PaginationFilter(int? first, string? after, int? last, string? before)
    {
        First = first;
        After = after;
        Last = last;
        Before = before;
    }

    /**
     * Number of items to take from the beginning.
     */
    public int? First { get; set; }

    /**
     * Cursor to start after.
     */
    public string? After { get; set; }

    /**
     * Number of items to take from the end.
     */
    public int? Last { get; set; }

    /**
     * Cursor to start before.
     */
    public string? Before { get; set; }
}
