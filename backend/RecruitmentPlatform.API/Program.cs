using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using RecruitmentPlatform.Core.Factories;
using RecruitmentPlatform.Core.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;
using RecruitmentPlatform.Infrastructure.Repositories;
using RecruitmentPlatform.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

var dotenvPath = Path.Combine(builder.Environment.ContentRootPath, ".env");
if (File.Exists(dotenvPath))
{
    Env.Load(dotenvPath);
    builder.Configuration.AddEnvironmentVariables();
}

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found. Configure it in .env, user secrets, or environment variables.");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' is empty. Configure it in .env, user secrets, or environment variables.");
}

var supabaseJwtSecret = builder.Configuration["JwtSettings:SupabaseJwtSecret"]
    ?? throw new InvalidOperationException("JWT secret 'JwtSettings:SupabaseJwtSecret' was not found. Configure it in .env, user secrets, or environment variables.");

if (string.IsNullOrWhiteSpace(supabaseJwtSecret))
{
    throw new InvalidOperationException("JWT secret 'JwtSettings:SupabaseJwtSecret' is empty. Configure it in .env, user secrets, or environment variables.");
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<EmailNotificationService>();
builder.Services.AddScoped<SmsNotificationService>();
builder.Services.AddScoped<NotificationFactory>(serviceProvider =>
    new NotificationFactory(
        serviceProvider.GetRequiredService<EmailNotificationService>(),
        serviceProvider.GetRequiredService<SmsNotificationService>()));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(supabaseJwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "RecruitmentPlatform API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste a valid JWT token here using the format: Bearer {token}"
    });

    options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", null!, null!),
            new List<string>()
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "ok",
    service = "RecruitmentPlatform API",
    utcTime = DateTime.UtcNow
}))
    .WithName("GetHealth")
    .WithTags("Health");

app.MapControllers();

app.Run();
