using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Core.DTOs;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class GeminiChatService : IAiChatService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string[] _models;
    private readonly ILogger<GeminiChatService> _logger;

    public GeminiChatService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiChatService> logger)
    {
        _httpClient = httpClient;
        _apiKey = configuration["GeminiSettings:ApiKey"]
            ?? configuration["GEMINI_API_KEY"]
            ?? string.Empty;
        var configuredModel = configuration["GeminiSettings:Model"]
            ?? configuration["GEMINI_MODEL"]
            ?? "gemini-2.5-flash";
        _models = BuildModelFallbacks(configuredModel);
        _logger = logger;
    }

    public async Task<string> GenerateResponseAsync(ChatGenerationRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("Gemini API key is missing.");
            return "The AI assistant is not configured yet. Please contact support or try again later.";
        }

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(TimeSpan.FromSeconds(20));

        for (var attempt = 1; attempt <= 3; attempt++)
        {
            try
            {
                var contents = request.History
                    .TakeLast(12)
                    .Select(msg => new
                    {
                        role = msg.Role.Equals("AI", StringComparison.OrdinalIgnoreCase) ? "model" : "user",
                        parts = new[] { new { text = msg.Content } }
                    })
                    .Cast<object>()
                    .ToList();

                contents.Add(new
                {
                    role = "user",
                    parts = new[] { new { text = request.UserMessage } }
                });

                var requestBody = new
                {
                    system_instruction = new
                    {
                        parts = new[] { new { text = request.SystemInstruction } }
                    },
                    contents,
                    generationConfig = new
                    {
                        temperature = 0.2,
                        topP = 0.8,
                        maxOutputTokens = 800
                    }
                };

                using var response = await SendWithModelFallbacksAsync(requestBody, timeoutCts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    if ((int)response.StatusCode >= 500 && attempt < 3)
                    {
                        await Task.Delay(TimeSpan.FromMilliseconds(200 * attempt), timeoutCts.Token);
                        continue;
                    }

                    var errorBody = await response.Content.ReadAsStringAsync(timeoutCts.Token);
                    _logger.LogWarning("Gemini API returned status code {StatusCode}: {ErrorBody}", response.StatusCode, TruncateForLog(errorBody));
                    return "I'm sorry, I couldn't process that request right now. Please try again later.";
                }

                var responseBody = await response.Content.ReadAsStringAsync(timeoutCts.Token);
                using var jsonDocument = JsonDocument.Parse(responseBody);

                var generatedText = jsonDocument.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return string.IsNullOrWhiteSpace(generatedText)
                    ? "I'm sorry, I could not generate a response from the available information."
                    : generatedText.Trim();
            }
            catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning("Gemini API request timed out on attempt {Attempt}.", attempt);
                if (attempt == 3)
                {
                    return "The AI assistant took too long to respond. Please try again.";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Gemini API.");
                if (attempt == 3)
                {
                    return "I'm sorry, I couldn't process that request right now. Please try again later.";
                }
            }
        }

        return "I'm sorry, I couldn't process that request right now. Please try again later.";
    }

    private async Task<HttpResponseMessage> SendWithModelFallbacksAsync(object requestBody, CancellationToken cancellationToken)
    {
        var json = JsonSerializer.Serialize(requestBody);
        HttpResponseMessage? lastResponse = null;

        foreach (var model in _models)
        {
            lastResponse?.Dispose();

            using var content = new StringContent(json, Encoding.UTF8, "application/json");
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{Uri.EscapeDataString(model)}:generateContent?key={Uri.EscapeDataString(_apiKey)}";
            var response = await _httpClient.PostAsync(url, content, cancellationToken);

            if (response.IsSuccessStatusCode || !IsModelUnavailable(response.StatusCode))
            {
                return response;
            }

            _logger.LogWarning("Gemini model {Model} is unavailable with status code {StatusCode}. Trying fallback model.", model, response.StatusCode);
            lastResponse = response;
        }

        return lastResponse ?? new HttpResponseMessage(System.Net.HttpStatusCode.BadRequest);
    }

    private static string[] BuildModelFallbacks(string configuredModel)
    {
        var models = new[] { configuredModel, "gemini-flash-latest", "gemini-2.0-flash" };
        return models
            .Select(NormalizeModel)
            .Where(model => !string.IsNullOrWhiteSpace(model))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private static string NormalizeModel(string model)
    {
        var normalized = model.Trim().Trim('"');
        return normalized.StartsWith("models/", StringComparison.OrdinalIgnoreCase)
            ? normalized["models/".Length..]
            : normalized;
    }

    private static bool IsModelUnavailable(System.Net.HttpStatusCode statusCode) =>
        statusCode is System.Net.HttpStatusCode.NotFound or System.Net.HttpStatusCode.BadRequest;

    private static string TruncateForLog(string value) =>
        value.Length <= 500 ? value : value[..500];
}
