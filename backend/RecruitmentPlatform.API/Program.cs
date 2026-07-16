using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using RecruitmentPlatform.API.Authentication;

using RecruitmentPlatform.Core.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;
using RecruitmentPlatform.Infrastructure.Repositories;
using RecruitmentPlatform.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Enable detailed PII logging for IdentityModel to debug JWT issues
Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;
Microsoft.IdentityModel.Logging.IdentityModelEventSource.LogCompleteSecurityArtifact = true;

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

var supabaseUrl = builder.Configuration["JwtSettings:SupabaseUrl"]
    ?? throw new InvalidOperationException("Supabase URL 'JwtSettings:SupabaseUrl' was not found in .env");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<EmailNotificationService>();
builder.Services.AddScoped<SmsNotificationService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();
builder.Services.AddScoped<INotificationFactory, NotificationFactory>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(supabaseJwtSecret));
        
        // Use OIDC Discovery to fetch the JWKS automatically from Supabase
        options.Authority = supabaseUrl;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidIssuer = supabaseUrl, // "iss" claim matching
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            // Fallback: If a token uses HS256, use our symmetric key. 
            // If it uses ES256, .NET automatically uses the downloaded JWKS.
            IssuerSigningKeys = new[] { signingKey },
            ValidAlgorithms = new[] { "ES256", "HS256" }
        };
    });

builder.Services.AddTransient<IClaimsTransformation, SupabaseClaimsTransformation>();

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

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
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

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    // Ensure database is created (if not using migrations)
    db.Database.EnsureCreated();
    
    if (!db.Roles.Any())
    {
        db.Roles.AddRange(
            new RecruitmentPlatform.Core.Entities.Role { Name = "Admin", Description = "Platform Administrator" },
            new RecruitmentPlatform.Core.Entities.Role { Name = "Recruiter", Description = "Company Recruiter" },
            new RecruitmentPlatform.Core.Entities.Role { Name = "Candidate", Description = "Job Seeker" }
        );
        db.SaveChanges();
    }
}

app.Run();
