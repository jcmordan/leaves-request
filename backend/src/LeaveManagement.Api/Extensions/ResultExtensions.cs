using LeaveManagement.Domain.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.Api.Extensions;

/// <summary>
/// Extensions to map Result objects to appropriate HTTP status codes.
/// </summary>
public static class ResultExtensions
{
    /// <summary>
    /// Maps a Result to a Minimal API IResult.
    /// </summary>
    public static IResult ToMinimalResult(this LeaveManagement.Domain.Common.Result result)
    {
        if (result.IsSuccess)
        {
            return Results.Ok();
        }

        return Results.Problem(
            statusCode: GetStatusCode(result.Error.Code),
            title: result.Error.Code,
            detail: result.Error.Message
        );
    }

    /// <summary>
    /// Maps a Result<T> to a Minimal API IResult.
    /// </summary>
    public static IResult ToMinimalResult<T>(this LeaveManagement.Domain.Common.Result<T> result)
    {
        if (result.IsSuccess)
        {
            return Results.Ok(result.Value);
        }

        return Results.Problem(
            statusCode: GetStatusCode(result.Error.Code),
            title: result.Error.Code,
            detail: result.Error.Message
        );
    }

    /// <summary>
    /// Maps a Result to an MVC ActionResult.
    /// </summary>
    public static ActionResult ToActionResult(this LeaveManagement.Domain.Common.Result result)
    {
        if (result.IsSuccess)
        {
            return new OkResult();
        }

        return new ObjectResult(new { error = result.Error })
        {
            StatusCode = GetStatusCode(result.Error.Code)
        };
    }

    private static int GetStatusCode(string errorCode)
    {
        return errorCode switch
        {
            string code when code.Contains("NotFound", StringComparison.OrdinalIgnoreCase) => StatusCodes.Status404NotFound,
            string code when code.Contains("Validation", StringComparison.OrdinalIgnoreCase) => StatusCodes.Status400BadRequest,
            string code when code.Contains("Conflict", StringComparison.OrdinalIgnoreCase) => StatusCodes.Status409Conflict,
            string code when code.Contains("Unauthorized", StringComparison.OrdinalIgnoreCase) => StatusCodes.Status401Unauthorized,
            string code when code.Contains("Forbidden", StringComparison.OrdinalIgnoreCase) => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError
        };
    }
}
