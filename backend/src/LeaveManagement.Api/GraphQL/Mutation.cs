using HotChocolate.Authorization;

namespace LeaveManagement.Api.GraphQL;

/// <summary>Base Mutation type for GraphQL. Logic is split into extension classes.</summary>
[Authorize]
public class Mutation
{
}
