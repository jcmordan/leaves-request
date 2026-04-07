using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using LeaveManagement.Infrastructure.Data;
using LeaveManagement.Infrastructure.Repositories;
using LeaveManagement.Domain.Interfaces;
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.Services;
using LeaveManagement.Infrastructure.Services;
using LeaveManagement.Api.GraphQL;
using LeaveManagement.Api.GraphQL.Queries;
using LeaveManagement.Api.GraphQL.Mutations;
using HotChocolate.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<LeaveManagementDbContext>(options =>
    options.UseNpgsql(connectionString, b => b.MigrationsAssembly("LeaveManagement.Infrastructure")));

// Authentication
builder.Services.AddMicrosoftIdentityWebApiAuthentication(builder.Configuration, "AzureAd");

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
builder.Services.AddHttpClient();

// HotChocolate GraphQL
builder.Services
    .AddGraphQLServer()
    .AddAuthorization()
    .AddQueryType<Query>()
    .AddTypeExtension<LeaveRequestQueries>()
    .AddTypeExtension<EmployeeQueries>()
    .AddTypeExtension<DepartmentQueries>()
    .AddMutationType<Mutation>()
    .AddTypeExtension<LeaveRequestMutations>()
    .AddTypeExtension<EmployeeMutations>()
    .AddTypeExtension<HolidayMutations>()
    .AddProjections()
    .AddFiltering()
    .AddSorting();

var app = builder.Build();

// Configure the HTTP request pipeline.

// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapGraphQL();

app.Run();
