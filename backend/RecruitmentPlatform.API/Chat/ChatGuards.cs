using System.Collections.Concurrent;
using System.Net;
using System.Text.RegularExpressions;

namespace RecruitmentPlatform.API.Chat;

public sealed record ChatValidationResult(bool IsValid, string SanitizedMessage, string? ErrorMessage);
public sealed record ChatScopeResult(bool IsAllowed, string? Response);

public interface IChatPermissionValidator
{
    bool IsAllowed(ChatResolvedContext context);
}

public sealed class ChatPermissionValidator : IChatPermissionValidator
{
    public bool IsAllowed(ChatResolvedContext context)
    {
        if (!context.Config.RequiresAuthentication)
        {
            return true;
        }

        if (!context.IsAuthenticated || context.UserId is null || string.IsNullOrWhiteSpace(context.Role))
        {
            return false;
        }

        return context.Config.AllowedRoles.Contains(context.Role);
    }
}

public interface IChatInputValidator
{
    ChatValidationResult Validate(string? message);
}

public sealed partial class ChatInputValidator : IChatInputValidator
{
    public const int MaxMessageLength = 2000;

    public ChatValidationResult Validate(string? message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return new ChatValidationResult(false, string.Empty, "Please enter a question before sending.");
        }

        var decoded = WebUtility.HtmlDecode(message);
        var withoutTags = HtmlTagRegex().Replace(decoded, string.Empty);
        var sanitized = ControlCharRegex().Replace(withoutTags, " ").Trim();

        if (sanitized.Length > MaxMessageLength)
        {
            return new ChatValidationResult(false, string.Empty, $"Please keep your message under {MaxMessageLength} characters.");
        }

        if (string.IsNullOrWhiteSpace(sanitized))
        {
            return new ChatValidationResult(false, string.Empty, "Please enter a valid question.");
        }

        return new ChatValidationResult(true, sanitized, null);
    }

    [GeneratedRegex("<.*?>", RegexOptions.Compiled)]
    private static partial Regex HtmlTagRegex();

    [GeneratedRegex(@"[\u0000-\u001F\u007F]+", RegexOptions.Compiled)]
    private static partial Regex ControlCharRegex();
}

public interface IChatScopeClassifier
{
    ChatScopeResult Classify(ChatResolvedContext context, string message);
}

public sealed class ChatScopeClassifier : IChatScopeClassifier
{
    private static readonly string[] PromptInjectionTerms =
    {
        "ignore previous", "ignore all previous", "developer message", "system prompt", "system instructions",
        "reveal prompt", "show prompt", "api key", "database password", "bypass", "jailbreak"
    };

    private static readonly string[] GeneralOutOfScopeTerms =
    {
        "weather", "sports", "recipe", "movie", "stock price", "crypto", "medical advice", "legal advice",
        "write malware", "politics", "president", "travel itinerary"
    };

    private static readonly Dictionary<string, string[]> CrossDashboardTerms = new(StringComparer.OrdinalIgnoreCase)
    {
        [ChatAssistantConfigProvider.Home] = new[] { "my application", "my profile", "candidate list", "admin analytics", "company staff", "recruiter notes" },
        [ChatAssistantConfigProvider.Candidate] = new[] { "admin dashboard", "company analytics", "all candidates", "other candidates", "staff list", "recruiter dashboard" },
        [ChatAssistantConfigProvider.Recruiter] = new[] { "admin dashboard", "company settings", "other recruiters", "candidate dashboard", "my private candidate profile" },
        [ChatAssistantConfigProvider.Admin] = new[] { "other company", "candidate private dashboard", "personal application status" },
        [ChatAssistantConfigProvider.HiringManager] = new[] { "admin dashboard", "company settings", "other hiring managers", "candidate private dashboard" }
    };

    public ChatScopeResult Classify(ChatResolvedContext context, string message)
    {
        var lower = message.ToLowerInvariant();

        if (PromptInjectionTerms.Any(lower.Contains))
        {
            return new ChatScopeResult(false, context.Config.OutOfScopeResponse);
        }

        if (GeneralOutOfScopeTerms.Any(lower.Contains))
        {
            return new ChatScopeResult(false, context.Config.OutOfScopeResponse);
        }

        if (context.Config.DisallowedTopics.Any(topic => lower.Contains(topic.ToLowerInvariant())))
        {
            return new ChatScopeResult(false, context.Config.OutOfScopeResponse);
        }

        if (CrossDashboardTerms.TryGetValue(context.Config.ContextKey, out var terms) && terms.Any(lower.Contains))
        {
            return new ChatScopeResult(false, context.Config.OutOfScopeResponse);
        }

        if (context.Config.ContextKey == ChatAssistantConfigProvider.Home)
        {
            var publicTopic = context.Config.AllowedTopics.Any(topic => lower.Contains(topic.ToLowerInvariant()));
            var generalHelp = lower.Contains("what is") || lower.Contains("how do") || lower.Contains("which dashboard") || lower.Contains("help") || lower.Contains("contact");
            if (!publicTopic && !generalHelp)
            {
                return new ChatScopeResult(false, context.Config.OutOfScopeResponse);
            }
        }

        return new ChatScopeResult(true, null);
    }
}

public interface IChatRateLimiter
{
    bool IsAllowed(string key);
}

public sealed class InMemoryChatRateLimiter : IChatRateLimiter
{
    private sealed class Bucket
    {
        public DateTimeOffset WindowStart { get; set; } = DateTimeOffset.UtcNow;
        public int Count { get; set; }
    }

    private readonly ConcurrentDictionary<string, Bucket> _buckets = new();
    private static readonly TimeSpan Window = TimeSpan.FromMinutes(1);
    private const int MaxRequestsPerWindow = 20;

    public bool IsAllowed(string key)
    {
        var now = DateTimeOffset.UtcNow;
        var bucket = _buckets.GetOrAdd(key, _ => new Bucket());

        lock (bucket)
        {
            if (now - bucket.WindowStart > Window)
            {
                bucket.WindowStart = now;
                bucket.Count = 0;
            }

            bucket.Count++;
            return bucket.Count <= MaxRequestsPerWindow;
        }
    }
}
