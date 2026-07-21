using Microsoft.Extensions.Configuration;

namespace RecruitmentPlatform.Infrastructure.Services;

internal static class LiveInterviewGeminiConfiguration
{
    public const string DefaultTextFallbackModel = "gemini-3.1-flash-lite";

    private static readonly string[] DefaultLiveModels =
    [
        "gemini-2.5-flash-native-audio-preview-12-2025",
        "gemini-3-flash-preview",
        "gemini-3.5-live-translate-preview"
    ];

    public static string[] GetApiKeys(IConfiguration configuration)
    {
        var keys = FirstConfigured(
            configuration["LIVE_INTERVIEW_GEMINI_API_KEYS"],
            configuration["LiveInterviewGemini:ApiKeys"]);

        return string.IsNullOrWhiteSpace(keys)
            ? []
            : keys.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }

    public static string[] GetModels(IConfiguration configuration)
    {
        var configuredModels = FirstConfigured(
            configuration["LIVE_INTERVIEW_GEMINI_MODELS"],
            configuration["LiveInterviewGemini:Models"]);

        var fallbackModel = FirstConfigured(
            configuration["LIVE_INTERVIEW_GEMINI_TEXT_FALLBACK_MODEL"],
            configuration["LiveInterviewGemini:TextFallbackModel"],
            DefaultTextFallbackModel);

        var liveModels = string.IsNullOrWhiteSpace(configuredModels)
            ? DefaultLiveModels
            : configuredModels.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        return liveModels
            .Concat([fallbackModel])
            .Select(NormalizeModel)
            .Where(model => !string.IsNullOrWhiteSpace(model))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private static string FirstConfigured(params string?[] values) =>
        values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value)) ?? string.Empty;

    private static string NormalizeModel(string model)
    {
        var normalized = model.Trim().Trim('"');
        return normalized.StartsWith("models/", StringComparison.OrdinalIgnoreCase)
            ? normalized["models/".Length..]
            : normalized;
    }
}
