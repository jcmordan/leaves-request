using HotChocolate;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LeaveManagement.Api.GraphQL.Filters;

/// <summary>
/// A global error filter for GraphQL to capture and log exceptions.
/// </summary>
public class GraphQLErrorFilter(
    ILogger<GraphQLErrorFilter> logger,
    IWebHostEnvironment environment
) : IErrorFilter
{
    private readonly ILogger<GraphQLErrorFilter> _logger = logger;
    private readonly IWebHostEnvironment _environment = environment;

    public IError OnError(IError error)
    {
        if (error.Exception != null)
        {
            _logger.LogError(
                error.Exception,
                "GraphQL Exception occurred: {Message}",
                error.Message
            );

            if (_environment.IsDevelopment())
            {
                return error
                    .WithMessage(error.Exception.Message)
                    .WithExtensions(
                        new Dictionary<string, object?>
                        {
                            { "stackTrace", error.Exception.StackTrace },
                            { "innerException", error.Exception.InnerException?.Message },
                            { "details", error.Exception.ToString() },
                        }
                    );
            }

            return error.WithMessage("An unexpected error occurred.");
        }

        return error;
    }
}
