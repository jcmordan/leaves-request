using System.Text;
using DotNetEnv;
using HotChocolate.Data;
using LeaveManagement.Api.GraphQL;
using LeaveManagement.Api.GraphQL.Mutations;
using LeaveManagement.Api.GraphQL.Queries;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Services;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Infrastructure.Data;
using LeaveManagement.Infrastructure.Data.Seeders;
using LeaveManagement.Infrastructure.Interfaces;
using LeaveManagement.Infrastructure.Models;
using LeaveManagement.Infrastructure.Repositories;
using LeaveManagement.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;

// Load environment variables from .env file in the root directory
Env.Load(System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "../../.env"));

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// DbContext
// DB_CONNECTION_STRING from .env takes precedence as the source of truth
var connectionString =
    Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<LeaveManagementDbContext>(options =>
    options.UseNpgsql(connectionString, b => b.MigrationsAssembly("LeaveManagement.Infrastructure"))
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
                    // A simple heuristic: Entra ID tokens are usually multi-part JWTs with specific claims,
                    // while our local tokens will be as well.
                    // For now, we just attempt both or let the policy handle it.
                    // A better way is to just let the Authentication system try all registered schemes.
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
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IPasswordHasher, Argon2PasswordHasher>();
builder.Services.AddHttpClient();

// HotChocolate GraphQL
builder
    .Services.AddGraphQLServer()
    .AddAuthorization()
    .AddQueryType<Query>()
    .AddTypeExtension<LeaveRequestQueries>()
    .AddTypeExtension<EmployeeQueries>()
    .AddTypeExtension<DepartmentQueries>()
    .AddMutationType<Mutation>()
    .AddTypeExtension<LeaveRequestMutations>()
    .AddTypeExtension<EmployeeMutations>()
    .AddTypeExtension<HolidayMutations>()
    .AddTypeExtension<AuthMutations>()
    .AddProjections()
    .AddFiltering()
    .AddSorting();

var app = builder.Build();

// Configure the HTTP request pipeline.

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

    // Seed Admin User
    var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD");
    var passwordHasher = services.GetRequiredService<IPasswordHasher>();
    Console.WriteLine("[Program] Attempting to seed admin user...");
    try
    {
        await UserSeeder.SeedAsync(context, adminPassword, passwordHasher);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Program] Error during admin seeding: {ex.Message}");
    }

    // Seed employees from CSV
    var csvPath = System.IO.Path.Combine(
        AppContext.BaseDirectory,
        "Data",
        "Seeders",
        "Employee.csv"
    );

    Console.WriteLine($"[Program] Attempting to seed employees from: {csvPath}");
    try
    {
        await EmployeeSeeder.SeedAsync(context, csvPath);
        Console.WriteLine("[Program] Employee seeding process completed.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Program] Error during employee seeding: {ex.Message}");
    }
}

app.Run();
