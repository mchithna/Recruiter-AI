using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class GeminiLiveInterviewService : IGeminiLiveInterviewService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _httpClient;
    private readonly string[] _apiKeys;
    private readonly string[] _models;
    private readonly bool _useVertexAi;
    private readonly string _vertexProjectId;
    private readonly string _vertexLocation;
    private readonly VertexAiAccessTokenProvider _vertexAccessTokenProvider;
    private readonly ILogger<GeminiLiveInterviewService> _logger;

    public GeminiLiveInterviewService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiLiveInterviewService> logger)
    {
        _httpClient = httpClient;
        _apiKeys = LiveInterviewGeminiConfiguration.GetApiKeys(configuration);
        _models = LiveInterviewGeminiConfiguration.GetModels(configuration);
        _useVertexAi = GeminiConfiguration.UseVertexAi(configuration);
        _vertexProjectId = GeminiConfiguration.GetVertexProjectId(configuration);
        _vertexLocation = GeminiConfiguration.GetVertexLocation(configuration);
        _vertexAccessTokenProvider = new VertexAiAccessTokenProvider(configuration);
        _logger = logger;
    }

    public async Task<T?> GenerateJsonAsync<T>(
        string systemInstruction,
        string userPrompt,
        int maxOutputTokens = 1200,
        CancellationToken cancellationToken = default)
    {
        if (_apiKeys.Length == 0 && (!_useVertexAi || string.IsNullOrWhiteSpace(_vertexProjectId)))
        {
            _logger.LogWarning("Live interview AI is missing both Gemini API keys and Vertex AI configuration.");
            return default;
        }

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(TimeSpan.FromSeconds(25));

        try
        {
            var requestBody = new
            {
                systemInstruction = new
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
                    temperature = 0.2,
                    topP = 0.8,
                    maxOutputTokens,
                    responseMimeType = "application/json",
                    thinkingConfig = new { thinkingBudget = 0 }
                }
            };

            using var response = await SendWithFallbacksAsync(requestBody, timeoutCts.Token);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(timeoutCts.Token);
                _logger.LogWarning("Live interview Gemini returned status {StatusCode}: {ErrorBody}", response.StatusCode, TruncateForLog(body));
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
            return string.IsNullOrWhiteSpace(json)
                ? default
                : JsonSerializer.Deserialize<T>(json, JsonOptions);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("Live interview Gemini request timed out.");
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling live interview Gemini.");
            return default;
        }
    }

    private async Task<HttpResponseMessage> SendWithFallbacksAsync(object requestBody, CancellationToken cancellationToken)
    {
        var json = JsonSerializer.Serialize(requestBody);
        HttpResponseMessage? lastResponse = null;

        foreach (var apiKey in _apiKeys)
        {
            if (string.IsNullOrWhiteSpace(apiKey)) continue;
            foreach (var model in _models)
            {
                lastResponse?.Dispose();
                using var content = new StringContent(json, Encoding.UTF8, "application/json");
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/{Uri.EscapeDataString(model)}:generateContent?key={Uri.EscapeDataString(apiKey)}";
                var response = await _httpClient.PostAsync(url, content, cancellationToken);
                if (response.IsSuccessStatusCode) return response;
                if (!IsFallbackStatus(response.StatusCode)) return response;
                _logger.LogWarning("Live interview Gemini model {Model} on key {KeyPrefix}... failed with status {StatusCode}. Trying fallback.", model, apiKey[..Math.Min(apiKey.Length, 6)], response.StatusCode);
                lastResponse = response;
            }
        }

        if (_useVertexAi && !string.IsNullOrWhiteSpace(_vertexProjectId))
        {
            var accessToken = await _vertexAccessTokenProvider.GetAccessTokenAsync(cancellationToken);

            foreach (var model in _models)
            {
                lastResponse?.Dispose();

                using var request = new HttpRequestMessage(HttpMethod.Post, BuildVertexAiUrl(model))
                {
                    Content = new StringContent(json, Encoding.UTF8, "application/json")
                };
                request.Headers.Authorization = new("Bearer", accessToken);

                var response = await _httpClient.SendAsync(request, cancellationToken);
                if (response.IsSuccessStatusCode) return response;
                if (!IsFallbackStatus(response.StatusCode)) return response;
                _logger.LogWarning("Vertex AI live interview model {Model} failed with status {StatusCode}. Trying fallback.", model, response.StatusCode);
                lastResponse = response;
            }
        }

        return lastResponse ?? new HttpResponseMessage(System.Net.HttpStatusCode.BadRequest);
    }

    private string BuildVertexAiUrl(string model)
    {
        var projectId = Uri.EscapeDataString(_vertexProjectId);
        var location = Uri.EscapeDataString(_vertexLocation);
        var modelId = Uri.EscapeDataString(model);
        return $"https://{location}-aiplatform.googleapis.com/v1/projects/{projectId}/locations/{location}/publishers/google/models/{modelId}:generateContent";
    }

    private static bool IsFallbackStatus(System.Net.HttpStatusCode statusCode) =>
        statusCode is System.Net.HttpStatusCode.NotFound
            or System.Net.HttpStatusCode.BadRequest
            or System.Net.HttpStatusCode.TooManyRequests
            or System.Net.HttpStatusCode.ServiceUnavailable
            or System.Net.HttpStatusCode.InternalServerError
            or System.Net.HttpStatusCode.Forbidden;

    private static string TruncateForLog(string value) =>
        value.Length <= 500 ? value : value[..500];

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
        if (firstObject < 0) return null;

        var depth = 0;
        var inString = false;
        var isEscaped = false;

        for (var index = firstObject; index < trimmed.Length; index++)
        {
            var current = trimmed[index];
            if (isEscaped)
            {
                isEscaped = false;
                continue;
            }

            if (current == '\\' && inString)
            {
                isEscaped = true;
                continue;
            }

            if (current == '"')
            {
                inString = !inString;
                continue;
            }

            if (inString) continue;

            if (current == '{') depth++;
            if (current == '}')
            {
                depth--;
                if (depth == 0)
                {
                    return trimmed[firstObject..(index + 1)];
                }
            }
        }

        return null;
    }
}
