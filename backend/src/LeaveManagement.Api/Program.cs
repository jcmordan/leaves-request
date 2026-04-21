using DotNetEnv;
using LeaveManagement.Api.Extensions;
using LeaveManagement.Infrastructure.Data;
using LeaveManagement.Infrastructure.Data.Seeders;
using Microsoft.EntityFrameworkCore;
using Path = System.IO.Path;

// Load environment variables from .env file if it exists, searching up in the directory tree
var envPath = "";
var currentDir = new DirectoryInfo(Directory.GetCurrentDirectory());
while (currentDir != null)
{
    var potentialPath = Path.Combine(currentDir.FullName, ".env");
    if (File.Exists(potentialPath))
    {
        envPath = potentialPath;
        break;
    }
    currentDir = currentDir.Parent;
}

if (!string.IsNullOrEmpty(envPath))
{
    Env.Load(envPath);
}
else if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")))
{
    // Only warn if we don't have a connection string already (standard Docker behavior)
    Console.WriteLine("Note: .env file not found. Relying on existing environment variables.");
}


var builder = WebApplication.CreateBuilder(args);

// Ensure the backend starts on the fixed port defined in .env or default to 5148
var backendUrl = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "http://localhost:5148";
builder.WebHost.UseUrls(backendUrl);

// DbContext
// DB_CONNECTION_STRING from .env takes precedence as the source of truth
var connectionString =
    Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

if (!string.IsNullOrEmpty(connectionString))
{
    // Mask the password for security in logs
    var maskedConnectionString = System.Text.RegularExpressions.Regex.Replace(
        connectionString,
        @"Password=[^;]*",
        "Password=********",
        System.Text.RegularExpressions.RegexOptions.IgnoreCase
    );
    Console.WriteLine($"[DEBUG] Using Connection String: {maskedConnectionString}");
}

if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string is not configured. Please set DB_CONNECTION_STRING in your .env file or " +
        "DefaultConnection in appsettings.json."
    );
}

// Register services via extension methods
builder.Services
    .AddDatabaseConfiguration(builder.Configuration, connectionString)
    .AddAuthenticationAndAuthorization(builder.Configuration)
    .AddApplicationServices()
    .AddGraphQLConfiguration()
    .AddInfrastructureServices(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseHttpLogging();
    app.UseDeveloperExceptionPage();
}

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
