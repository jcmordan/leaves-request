using System.Text;
using LeaveManagement.Api.GraphQL;
using LeaveManagement.Api.GraphQL.DataLoaders;
using LeaveManagement.Api.GraphQL.Filters;
using LeaveManagement.Api.GraphQL.Mutations;
using LeaveManagement.Api.GraphQL.Queries;
using LeaveManagement.Api.GraphQL.Types;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Services;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;
using LeaveManagement.Infrastructure.Interfaces;
using LeaveManagement.Infrastructure.Repositories;
using LeaveManagement.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;

namespace LeaveManagement.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDatabaseConfiguration(this IServiceCollection services, IConfiguration configuration, string connectionString)
    {
        services.AddPooledDbContextFactory<LeaveManagementDbContext>(options =>
            options.UseNpgsql(connectionString, b => b.MigrationsAssembly("LeaveManagement.Infrastructure"))
        );

        services.AddScoped(sp =>
            sp.GetRequiredService<IDbContextFactory<LeaveManagementDbContext>>().CreateDbContext()
        );

        return services;
    }

    public static IServiceCollection AddAuthenticationAndAuthorization(this IServiceCollection services, IConfiguration configuration)
    {
        // Bridge environment variables from .env to AzureAd section if they are set
        var entraId = Environment.GetEnvironmentVariable("AUTH_MICROSOFT_ENTRA_ID_ID");
        var entraTenant = Environment.GetEnvironmentVariable("AUTH_MICROSOFT_ENTRA_ID_TENANT_ID");

        if (!string.IsNullOrEmpty(entraId))
        {
            configuration["AzureAd:ClientId"] = entraId;
        }
        if (!string.IsNullOrEmpty(entraTenant))
        {
            configuration["AzureAd:TenantId"] = entraTenant;
        }

        // Check if AzureAD is validly configured
        var isAzureAdConfigured = !string.IsNullOrEmpty(configuration["AzureAd:ClientId"]) && 
                                  configuration["AzureAd:ClientId"] != "YOUR_CLIENT_ID";

        var authBuilder = services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = "Hybrid";
            options.DefaultChallengeScheme = "Hybrid";
        });

        authBuilder.AddPolicyScheme(
            "Hybrid",
            "Hybrid",
            options =>
            {
                options.ForwardDefaultSelector = context =>
                {
                    var authHeader = context.Request.Headers["Authorization"].ToString();
                    if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                    {
                        var token = authHeader.Substring("Bearer ".Length).Trim();
                        try
                        {
                            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                            if (handler.CanReadToken(token))
                            {
                                var jwtToken = handler.ReadJwtToken(token);
                                var localIssuer = configuration.GetSection("Jwt")["Issuer"];

                                if (
                                    !string.IsNullOrEmpty(localIssuer)
                                    && string.Equals(
                                        jwtToken.Issuer,
                                        localIssuer,
                                        StringComparison.OrdinalIgnoreCase
                                    )
                                )
                                {
                                    return "LocalBearer";
                                }
                            }
                        }
                        catch
                        {
                            // Ignore parsing errors, fallback to default
                        }
                    }
                    return isAzureAdConfigured ? JwtBearerDefaults.AuthenticationScheme : "LocalBearer";
                };
            }
        );

        if (isAzureAdConfigured)
        {
            authBuilder.AddMicrosoftIdentityWebApi(
                configuration,
                "AzureAd",
                JwtBearerDefaults.AuthenticationScheme
            );
        }
        else
        {
            Console.WriteLine("Warning: Azure AD authentication is not configured (ClientId is missing or placeholder). Skipping Microsoft Identity Web setup.");
        }

        authBuilder.AddJwtBearer(
            "LocalBearer",
            options =>
            {
                var jwtSettings = configuration.GetSection("Jwt");
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSettings["Key"]!)
                    ),
                };
            }
        );

        services.AddTransient<IClaimsTransformation, CustomClaimsTransformation>();

        services.AddAuthorizationBuilder()
            .SetDefaultPolicy(
                new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
                    .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme, "LocalBearer")
                    .RequireAuthenticatedUser()
                    .Build()
            )
            .AddPolicy("RequireEmployee", policy => policy.RequireRole("Employee", "Manager", "HRManager"))
            .AddPolicy("RequireManager", policy => policy.RequireRole("Manager", "HRManager"))
            .AddPolicy("RequireHR", policy => policy.RequireRole("HRManager"));

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Generic Repositories & Unit of Work
        services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Application Services
        services.AddHttpContextAccessor();
        services.AddScoped<IHolidayService, HolidayService>();
        services.AddScoped<ILeaveRequestService, LeaveRequestService>();
        services.AddScoped<IBalanceService, BalanceService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<ICompanyService, CompanyService>();
        services.AddScoped<IDepartmentSectionService, DepartmentSectionService>();
        services.AddScoped<IJobTitleService, JobTitleService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddSingleton<IPasswordHasher, Argon2PasswordHasher>();

        return services;
    }

    public static IServiceCollection AddGraphQLConfiguration(this IServiceCollection services)
    {
        services
            .AddGraphQLServer()
            .AddType<UploadType>()
            .ModifyCostOptions(o => o.MaxFieldCost = 2000)
            .AddAuthorization()
            .AddQueryType<Query>()
            .AddTypeExtension<LeaveRequestQueries>()
            .AddTypeExtension<EmployeeQueries>()
            .AddTypeExtension<DepartmentQueries>()
            .AddTypeExtension<JobTitleQueries>()
            .AddTypeExtension<CompanyQueries>()
            .AddTypeExtension<DepartmentSectionQueries>()
            .AddTypeExtension<HolidayQueries>()
            .AddMutationType<Mutation>()
            .AddTypeExtension<LeaveRequestMutations>()
            .AddTypeExtension<EmployeeMutations>()
            .AddTypeExtension<HolidayMutations>()
            .AddTypeExtension<AuthMutations>()
            .AddType<EmployeeType>()
            .AddType<AbsenceRequestType>()
            .AddType<LeaveRequestSummaryType>()
            .AddDataLoader<ICompanyByIdDataLoader, CompanyByIdDataLoader>()
            .AddDataLoader<IDepartmentByIdDataLoader, DepartmentByIdDataLoader>()
            .AddDataLoader<IDepartmentSectionByIdDataLoader, DepartmentSectionByIdDataLoader>()
            .AddDataLoader<ISubordinatesByEmployeeIdDataLoader, SubordinatesByEmployeeIdDataLoader>()
            .AddDataLoader<IJobTitleByIdDataLoader, JobTitleByIdDataLoader>()
            .AddDataLoader<IEmployeeByIdDataLoader, EmployeeByIdDataLoader>()
            .AddDataLoader<IAbsenceTypeByIdDataLoader, AbsenceTypeByIdDataLoader>()
            .AddDataLoader<IAttachmentsByAbsenceRequestIdDataLoader, AttachmentsByAbsenceRequestIdDataLoader>()
            .AddDataLoader<IApprovalHistoriesByAbsenceRequestIdDataLoader, ApprovalHistoriesByAbsenceRequestIdDataLoader>()
            .AddDataLoader<ILeaveBalanceDataLoader, LeaveBalanceDataLoader>()
            .AddProjections()
            .AddFiltering()
            .AddSorting()
            .AddErrorFilter<GraphQLErrorFilter>();

        return services;
    }

    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpClient();
        services.AddHttpLogging(logging =>
        {
            configuration.GetSection("HttpLogging").Bind(logging);
        });

        return services;
    }
}
