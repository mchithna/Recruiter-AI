using Microsoft.Extensions.Configuration;

namespace RecruitmentPlatform.Infrastructure.Services;

internal static class GeminiConfiguration
{
    public const string DefaultModel = "gemini-2.5-flash";

    private static readonly string[] ModelFallbacks =
    [
        DefaultModel,
        "gemini-2.5-flash-lite",
        "gemini-flash-latest",
        "gemini-2.0-flash"
    ];

    public static string GetApiKey(IConfiguration configuration)
    {
        return FirstConfigured(
            configuration["GEMINI_API_KEY"],
            configuration["GeminiSettings:ApiKey"],
            configuration["RecruiterGeminiSettings:ApiKey"]);
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
        var provider = FirstConfigured(
            configuration["GEMINI_PROVIDER"],
            configuration["GeminiSettings:Provider"]);

        return provider.Equals("vertex", StringComparison.OrdinalIgnoreCase)
            || provider.Equals("vertex-ai", StringComparison.OrdinalIgnoreCase);
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
}
