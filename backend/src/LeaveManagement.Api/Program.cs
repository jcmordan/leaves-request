using System.Text;
using DotNetEnv;
using HotChocolate.Data;
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
using LeaveManagement.Infrastructure.Data.Seeders;
using LeaveManagement.Infrastructure.Interfaces;
using LeaveManagement.Infrastructure.Repositories;
using LeaveManagement.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;

// Load environment variables from .env file in the root directory
Env.Load(System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "../../.env"));

var builder = WebApplication.CreateBuilder(args);

// Ensure the backend starts on the fixed port defined in .env or default to 5148
var backendUrl = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "http://localhost:5148";
builder.WebHost.UseUrls(backendUrl);

// Add services to the container.

// DbContext
// DB_CONNECTION_STRING from .env takes precedence as the source of truth
var connectionString =
    Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddPooledDbContextFactory<LeaveManagementDbContext>(options =>
    options.UseNpgsql(connectionString, b => b.MigrationsAssembly("LeaveManagement.Infrastructure"))
);

builder.Services.AddScoped(sp =>
    sp.GetRequiredService<IDbContextFactory<LeaveManagementDbContext>>().CreateDbContext()
);

// Authentication
builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = "Hybrid";
        options.DefaultChallengeScheme = "Hybrid";
    })
    .AddPolicyScheme(
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
                            var localIssuer = builder.Configuration.GetSection("Jwt")["Issuer"];

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
                return JwtBearerDefaults.AuthenticationScheme; // Default to AzureAd Bearer
            };
        }
    )
    .AddMicrosoftIdentityWebApi(
        builder.Configuration,
        "AzureAd",
        JwtBearerDefaults.AuthenticationScheme
    );

builder
    .Services.AddAuthentication()
    .AddJwtBearer(
        "LocalBearer",
        options =>
        {
            var jwtSettings = builder.Configuration.GetSection("Jwt");
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

// Custom Claims Transformation for local roles
builder.Services.AddTransient<IClaimsTransformation, CustomClaimsTransformation>();

// Authorization Policies
builder
    .Services.AddAuthorizationBuilder()
    .SetDefaultPolicy(
        new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
            .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme, "LocalBearer")
            .RequireAuthenticatedUser()
            .Build()
    )
    .AddPolicy("RequireEmployee", policy => policy.RequireRole("Employee", "Manager", "HRManager"))
    .AddPolicy("RequireManager", policy => policy.RequireRole("Manager", "HRManager"))
    .AddPolicy("RequireHR", policy => policy.RequireRole("HRManager"));

// Generic Repositories & Unit of Work
builder.Services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Application Services
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IHolidayService, HolidayService>();
builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();
builder.Services.AddScoped<IBalanceService, BalanceService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IDepartmentSectionService, DepartmentSectionService>();
builder.Services.AddScoped<IJobTitleService, JobTitleService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IPasswordHasher, Argon2PasswordHasher>();

// DataLoaders registration in DI
builder.Services.AddScoped<CompanyByIdDataLoader>();
builder.Services.AddScoped<DepartmentByIdDataLoader>();
builder.Services.AddScoped<DepartmentSectionByIdDataLoader>();
builder.Services.AddScoped<SubordinatesByEmployeeIdDataLoader>();
builder.Services.AddScoped<JobTitleByIdDataLoader>();
builder.Services.AddScoped<EmployeeByIdDataLoader>();
builder.Services.AddScoped<LeaveBalanceDataLoader>();

builder.Services.AddHttpClient();
builder.Services.AddHttpLogging(logging =>
{
    builder.Configuration.GetSection("HttpLogging").Bind(logging);
});

// HotChocolate GraphQL
builder
    .Services.AddGraphQLServer()
    .ModifyCostOptions(o => o.MaxFieldCost = 2000)
    .AddAuthorization()
    .AddQueryType<Query>()
    .AddTypeExtension<LeaveRequestQueries>()
    .AddTypeExtension<EmployeeQueries>()
    .AddTypeExtension<DepartmentQueries>()
    .AddTypeExtension<JobTitleQueries>()
    .AddTypeExtension<CompanyQueries>()
    .AddTypeExtension<DepartmentSectionQueries>()
    .AddMutationType<Mutation>()
    .AddTypeExtension<LeaveRequestMutations>()
    .AddTypeExtension<EmployeeMutations>()
    .AddTypeExtension<HolidayMutations>()
    .AddTypeExtension<AuthMutations>()
    .AddType<EmployeeType>()
    .AddDataLoader<CompanyByIdDataLoader>()
    .AddDataLoader<DepartmentByIdDataLoader>()
    .AddDataLoader<DepartmentSectionByIdDataLoader>()
    .AddDataLoader<SubordinatesByEmployeeIdDataLoader>()
    .AddDataLoader<JobTitleByIdDataLoader>()
    .AddDataLoader<EmployeeByIdDataLoader>()
    .AddDataLoader<LeaveBalanceDataLoader>()
    .AddProjections()
    .AddFiltering()
    .AddSorting()
    .AddErrorFilter<GraphQLErrorFilter>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseHttpLogging();
    app.UseDeveloperExceptionPage();
}

// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapGraphQL();

// Database Seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<LeaveManagementDbContext>();

    // Ensure database is created and migrations are applied
    await context.Database.MigrateAsync();
    await DataSeeder.SeedAsync(context);
}

app.Run();
