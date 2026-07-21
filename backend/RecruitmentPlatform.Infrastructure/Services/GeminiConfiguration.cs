using Microsoft.Extensions.Configuration;

namespace RecruitmentPlatform.Infrastructure.Services;

internal static class GeminiConfiguration
{
    public const string DefaultModel = "gemini-3.1-flash-lite";

    private static readonly string[] ModelFallbacks =
    [
        "gemini-3.1-flash-lite",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-2.5-flash",
        "gemini-3.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-002"
    ];

    public static string[] GetApiKeys(IConfiguration configuration)
    {
        var keysString = FirstConfigured(
            configuration["GEMINI_API_KEYS"],
            configuration["GEMINI_API_KEY"],
            configuration["GeminiSettings:ApiKeys"],
            configuration["GeminiSettings:ApiKey"]);

        if (string.IsNullOrWhiteSpace(keysString)) return [];
        return keysString.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }

    public static string[] GetModels(IConfiguration configuration)
    {
        var configuredModels = FirstConfigured(
            configuration["GEMINI_MODELS"],
            configuration["GeminiSettings:Models"],
            configuration["RecruiterGeminiSettings:Models"]);

        var configuredModel = FirstConfigured(
            configuration["GEMINI_MODEL"],
            configuration["GeminiSettings:Model"],
            configuration["RecruiterGeminiSettings:Model"]);

        var modelCandidates = configuredModels
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Concat([configuredModel, DefaultModel]);

        var models = modelCandidates
            .Concat(ModelFallbacks)
            .Select(NormalizeModel)
            .Where(model => !string.IsNullOrWhiteSpace(model))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return models.Length > 0 ? models : [DefaultModel];
    }

    private static string FirstConfigured(params string?[] values)
    {
        return values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value)) ?? string.Empty;
    }

    private static string NormalizeModel(string model)
    {
        var normalized = model.Trim().Trim('"');
        return normalized.StartsWith("models/", StringComparison.OrdinalIgnoreCase)
            ? normalized["models/".Length..]
            : normalized;
    }

    public static bool UseVertexAi(IConfiguration configuration)
    {
        var provider = FirstConfigured(
            configuration["GEMINI_PROVIDER"],
            configuration["GeminiSettings:Provider"])
            .Trim()
            .Trim('"')
            .ToLowerInvariant();

        return provider switch
        {
            "api-key" or "apikey" or "ai-studio" or "aistudio" => false,
            "vertex" or "vertex-ai" or "vertexai" or "hybrid" or "auto" => !string.IsNullOrWhiteSpace(GetVertexProjectId(configuration)),
            _ => !string.IsNullOrWhiteSpace(GetVertexProjectId(configuration))
        };
    }

    public static string GetVertexProjectId(IConfiguration configuration)
    {
        return FirstConfigured(
            configuration["VERTEX_AI_PROJECT_ID"],
            configuration["GOOGLE_CLOUD_PROJECT"],
            configuration["GeminiSettings:VertexProjectId"],
            configuration["VertexAI:ProjectId"]);
    }

    public static string GetVertexLocation(IConfiguration configuration)
    {
        return FirstConfigured(
            configuration["VERTEX_AI_LOCATION"],
            configuration["GOOGLE_CLOUD_LOCATION"],
            configuration["GeminiSettings:VertexLocation"],
            configuration["VertexAI:Location"],
            "us-central1");
    }

    public static string GetVertexAccessToken(IConfiguration configuration)
    {
        return FirstConfigured(
            configuration["VERTEX_AI_ACCESS_TOKEN"],
            configuration["GOOGLE_ACCESS_TOKEN"],
            configuration["GeminiSettings:VertexAccessToken"],
            configuration["VertexAI:AccessToken"]);
    }

    public static string GetVertexServiceAccountJson(IConfiguration configuration)
    {
        return FirstConfigured(
            configuration["VERTEX_AI_SERVICE_ACCOUNT_JSON"],
            configuration["GOOGLE_APPLICATION_CREDENTIALS_JSON"],
            configuration["GeminiSettings:VertexServiceAccountJson"],
            configuration["VertexAI:ServiceAccountJson"]);
    }

    public static string GetVertexServiceAccountPath(IConfiguration configuration)
    {
        return FirstConfigured(
            configuration["VERTEX_AI_SERVICE_ACCOUNT_PATH"],
            configuration["GOOGLE_APPLICATION_CREDENTIALS"],
            configuration["GeminiSettings:VertexServiceAccountPath"],
            configuration["VertexAI:ServiceAccountPath"]);
    }
}
