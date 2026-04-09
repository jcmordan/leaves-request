using System;
using System.Collections.Generic;
using System.Linq;
using HotChocolate.Types.Pagination;
using LeaveManagement.Application.Models.Paging;

namespace LeaveManagement.Api.GraphQL.Pagination;

/**
 * Extension methods for converting pagination results to GraphQL connections.
 */
public static class ConnectionHelper
{
    /**
     * Converts a PaginationResult to a HotChocolate Connection.
     */
    public static Connection<TNode> ToConnection<TNode>(
        this PaginationResult<TNode> paginationResult
    )
    {
        List<Edge<TNode>> edges = paginationResult
            .Items.Select(static item => new Edge<TNode>(item, EncodeCursor(GetId(item))))
            .ToList();

        ConnectionPageInfo pageInfo = new ConnectionPageInfo(
            hasNextPage: paginationResult.HasNextPage,
            hasPreviousPage: paginationResult.HasPreviousPage,
            startCursor: paginationResult.StartCursor,
            endCursor: paginationResult.EndCursor
        );

        return new Connection<TNode>(edges, pageInfo);
    }

    /**
     * Encodes a Guid as a base64 string for use as a cursor.
     */
    private static string EncodeCursor(Guid id)
    {
        return Convert.ToBase64String(id.ToByteArray());
    }

    /**
     * Extracts the Id property from a node.
     */
    private static Guid GetId<TNode>(TNode node)
    {
        if (node == null)
        {
            return Guid.Empty;
        }

        var idProperty = typeof(TNode).GetProperty("Id");
        if (idProperty != null && idProperty.PropertyType == typeof(Guid))
        {
            return (Guid)(idProperty.GetValue(node) ?? Guid.Empty);
        }

        throw new InvalidOperationException($"Type {typeof(TNode).Name} does not have a Guid Id property.");
    }
}
