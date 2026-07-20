using Microsoft.Extensions.Configuration;

namespace RecruitmentPlatform.Infrastructure.Services;

internal static class GeminiConfiguration
{
    public const string DefaultModel = "gemini-2.5-flash-lite";

    private static readonly string[] ModelFallbacks =
    [
        DefaultModel,
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
}
