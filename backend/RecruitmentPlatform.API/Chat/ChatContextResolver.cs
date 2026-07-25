using System.Security.Claims;
using RecruitmentPlatform.Core.DTOs;

namespace RecruitmentPlatform.API.Chat;

public sealed record ChatResolvedContext(
    ChatAssistantConfig Config,
    int? UserId,
    string? Role,
    int? CompanyId,
    int? DepartmentId,
    bool IsAuthenticated);

public interface IChatContextResolver
{
    ChatResolvedContext Resolve(string? path, ClaimsPrincipal user, string? requestedContextKey = null);
    ChatContextMetadataDto ToMetadata(ChatResolvedContext context);
}

public sealed class ChatContextResolver : IChatContextResolver
{
    private readonly IChatAssistantConfigProvider _configProvider;

    public ChatContextResolver(IChatAssistantConfigProvider configProvider)
    {
        _configProvider = configProvider;
    }

    public ChatResolvedContext Resolve(string? path, ClaimsPrincipal user, string? requestedContextKey = null)
    {
        var userId = TryReadIntClaim(user, "app_user_id");
        var isAuthenticated = user.Identity?.IsAuthenticated == true || userId.HasValue;
        var role = NormalizeRole(user.FindFirst(ClaimTypes.Role)?.Value);
        var companyId = TryReadIntClaim(user, "company_id");
        var departmentId = TryReadIntClaim(user, "department_id");
        var routeContext = ResolveContextKeyFromPath(path, role);
        var contextKey = string.IsNullOrWhiteSpace(path) && !string.IsNullOrWhiteSpace(requestedContextKey)
            ? requestedContextKey
            : routeContext;

        if (!string.IsNullOrWhiteSpace(requestedContextKey)
            && !string.IsNullOrWhiteSpace(path)
            && !string.Equals(requestedContextKey, routeContext, StringComparison.OrdinalIgnoreCase))
        {
            contextKey = routeContext;
        }

        var config = _configProvider.Get(contextKey);

        return new ChatResolvedContext(config, userId, role, companyId, departmentId, isAuthenticated);
    }

    public ChatContextMetadataDto ToMetadata(ChatResolvedContext context)
    {
        return new ChatContextMetadataDto
        {
            ContextKey = context.Config.ContextKey,
            AssistantName = context.Config.AssistantName,
            WelcomeMessage = context.Config.WelcomeMessage,
            ScopeDescription = context.Config.ScopeDescription,
            OutOfScopeResponse = context.Config.OutOfScopeResponse,
            MissingDataResponse = context.Config.MissingDataResponse,
            RequiresAuthentication = context.Config.RequiresAuthentication,
            ExampleQuestions = context.Config.ExampleQuestions
        };
    }

    private static string ResolveContextKeyFromPath(string? path, string? role)
    {
        var normalized = (path ?? string.Empty).Trim().ToLowerInvariant();

        if (normalized.StartsWith("/candidate"))
        {
            return ChatAssistantConfigProvider.Candidate;
        }

        if (normalized.StartsWith("/recruiter"))
        {
            return ChatAssistantConfigProvider.Recruiter;
        }

        if (normalized.StartsWith("/admin"))
        {
            return ChatAssistantConfigProvider.Admin;
        }

        if (normalized.StartsWith("/hiring-manager"))
        {
            return ChatAssistantConfigProvider.HiringManager;
        }

        if (normalized.StartsWith("/dashboard") && !string.IsNullOrWhiteSpace(role))
        {
            return NormalizeRole(role) switch
            {
                "Candidate" => ChatAssistantConfigProvider.Candidate,
                "Recruiter" => ChatAssistantConfigProvider.Recruiter,
                "Admin" => ChatAssistantConfigProvider.Admin,
                "HiringManager" => ChatAssistantConfigProvider.HiringManager,
                _ => ChatAssistantConfigProvider.Home
            };
        }

        return ChatAssistantConfigProvider.Home;
    }

    private static int? TryReadIntClaim(ClaimsPrincipal user, string claimType)
    {
        var value = user.FindFirst(claimType)?.Value;
        return int.TryParse(value, out var result) ? result : null;
    }

    private static string? NormalizeRole(string? role)
    {
        return role?.Trim().ToLowerInvariant() switch
        {
            "admin" => "Admin",
            "recruiter" => "Recruiter",
            "candidate" => "Candidate",
            "hiringmanager" => "HiringManager",
            "hiring-manager" => "HiringManager",
            "hiring_manager" => "HiringManager",
            _ => role
        };
    }
}
