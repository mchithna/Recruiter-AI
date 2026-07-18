using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class GeminiStructuredService : IGeminiStructuredService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly ILogger<GeminiStructuredService> _logger;

    public GeminiStructuredService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<GeminiStructuredService> logger)
    {
        _httpClient = httpClient;
        _apiKey = configuration["RecruiterGeminiSettings:ApiKey"]
            ?? configuration["GEMINI_API_KEY"]
            ?? string.Empty;
        _model = configuration["RecruiterGeminiSettings:Model"]
            ?? configuration["GEMINI_MODEL"]
            ?? "gemini-1.5-flash";
        _logger = logger;
    }

    public async Task<T?> GenerateJsonAsync<T>(
        string systemInstruction,
        string userPrompt,
        int maxOutputTokens = 1200,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            _logger.LogWarning("Recruiter Gemini API key is missing.");
            return default;
        }

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(TimeSpan.FromSeconds(25));

        for (var attempt = 1; attempt <= 3; attempt++)
        {
            try
            {
                var requestBody = new
                {
                    system_instruction = new
                    {
                        parts = new[] { new { text = systemInstruction } }
                    },
                    contents = new[]
                    {
                        new
                        {
                            role = "user",
                            parts = new[] { new { text = userPrompt } }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.1,
                        topP = 0.8,
                        maxOutputTokens,
                        responseMimeType = "application/json"
                    }
                };

                using var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/{Uri.EscapeDataString(_model)}:generateContent?key={Uri.EscapeDataString(_apiKey)}";
                using var response = await _httpClient.PostAsync(url, content, timeoutCts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    if ((int)response.StatusCode >= 500 && attempt < 3)
                    {
                        await Task.Delay(TimeSpan.FromMilliseconds(250 * attempt), timeoutCts.Token);
                        continue;
                    }

                    _logger.LogWarning("Recruiter Gemini API returned status code {StatusCode}.", response.StatusCode);
                    return default;
                }

                var responseBody = await response.Content.ReadAsStringAsync(timeoutCts.Token);
                using var document = JsonDocument.Parse(responseBody);
                var text = document.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                var json = ExtractJson(text);
                if (string.IsNullOrWhiteSpace(json))
                {
                    return default;
                }

                return JsonSerializer.Deserialize<T>(json, JsonOptions);
            }
            catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning("Recruiter Gemini API request timed out on attempt {Attempt}.", attempt);
                if (attempt == 3) return default;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Recruiter Gemini API.");
                if (attempt == 3) return default;
            }
        }

        return default;
    }

    private static string? ExtractJson(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;

        var trimmed = text.Trim();
        if (trimmed.StartsWith("```", StringComparison.Ordinal))
        {
            var firstNewLine = trimmed.IndexOf('\n');
            var lastFence = trimmed.LastIndexOf("```", StringComparison.Ordinal);
            if (firstNewLine >= 0 && lastFence > firstNewLine)
            {
                trimmed = trimmed[(firstNewLine + 1)..lastFence].Trim();
            }
        }

        var firstObject = trimmed.IndexOf('{');
        var lastObject = trimmed.LastIndexOf('}');
        if (firstObject < 0 || lastObject <= firstObject) return null;

        return trimmed[firstObject..(lastObject + 1)];
    }
}
