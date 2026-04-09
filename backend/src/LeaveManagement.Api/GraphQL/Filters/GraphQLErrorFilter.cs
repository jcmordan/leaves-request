using HotChocolate;
using Microsoft.Extensions.Logging;

namespace LeaveManagement.Api.GraphQL.Filters;

/// <summary>
/// A global error filter for GraphQL to capture and log exceptions.
/// </summary>
public class GraphQLErrorFilter : IErrorFilter
{
    private readonly ILogger<GraphQLErrorFilter> _logger;

    public GraphQLErrorFilter(ILogger<GraphQLErrorFilter> logger)
    {
        _logger = logger;
    }

    public IError OnError(IError error)
    {
        if (error.Exception != null)
        {
            _logger.LogError(error.Exception, "GraphQL Exception occurred: {Message}", error.Message);

            return error.WithMessage(error.Exception.Message);
        }

        return error;
    }
}
