# --- Build Stage ---
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy solution and project files
COPY LeaveManagement.slnx ./
COPY src/LeaveManagement.Api/LeaveManagement.Api.csproj src/LeaveManagement.Api/
COPY src/LeaveManagement.Domain/LeaveManagement.Domain.csproj src/LeaveManagement.Domain/
COPY src/LeaveManagement.Application/LeaveManagement.Application.csproj src/LeaveManagement.Application/
COPY src/LeaveManagement.Infrastructure/LeaveManagement.Infrastructure.csproj src/LeaveManagement.Infrastructure/

# Restore dependencies
# Note: slnx is a new solution format, we might need to target the project directly if dotnet restore doesn't support it yet in alpine
RUN dotnet restore src/LeaveManagement.Api/LeaveManagement.Api.csproj

# Copy the rest of the source code
COPY . .

# Build and publish
WORKDIR /src/src/LeaveManagement.Api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# --- Runtime Stage ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

COPY --from=build /app/publish .

# Environment variables
ENV ASPNETCORE_URLS=http://+:5148
ENV UPLOADS_DIRECTORY=/app/uploads

USER appuser

EXPOSE 5148

ENTRYPOINT ["dotnet", "LeaveManagement.Api.dll"]
