using Microsoft.Extensions.Configuration;

namespace RecruitmentPlatform.Infrastructure.Services;

internal static class GeminiConfiguration
{
    public const string DefaultModel = "gemini-2.5-flash";

    private static readonly string[] ModelFallbacks =
    [
        "gemini-3.5-flash",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-3.1-flash-lite"
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
        var configuredModel = FirstConfigured(
            configuration["GEMINI_MODEL"],
            configuration["GeminiSettings:Model"],
            configuration["RecruiterGeminiSettings:Model"]);

        var models = new[] { configuredModel, DefaultModel }
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
        return !string.IsNullOrWhiteSpace(GetVertexProjectId(configuration));
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
}
