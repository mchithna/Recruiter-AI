using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class OpenAiStructuredService : IAiStructuredService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly ILogger<OpenAiStructuredService> _logger;

    public OpenAiStructuredService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<OpenAiStructuredService> logger)
    {
        _httpClient = httpClient;
        _apiKey = configuration["OPENAI_API_KEY"] ?? string.Empty;
        _model = configuration["OPENAI_MODEL"] ?? "gpt-4o-mini";
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
            _logger.LogWarning("OpenAI API key is missing.");
            return default;
        }

        // Enforce strong typing rules and exact schema
        var schemaDesc = GetSchemaDescription(typeof(T));
        systemInstruction += "\n\nCRITICAL: You MUST return ONLY raw, valid JSON. Do not include markdown formatting or backticks. Ensure your JSON exactly matches the requested structure. If a field expects a string, do NOT return an array.\n\nEXPECTED JSON SCHEMA:\n" + schemaDesc;

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(TimeSpan.FromSeconds(30));

        var requestBody = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = systemInstruction },
                new { role = "user", content = userPrompt }
            },
            max_completion_tokens = maxOutputTokens,
            temperature = 0.2
        };

        var jsonBody = JsonSerializer.Serialize(requestBody, JsonOptions);
        using var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        try
        {
            var response = await _httpClient.SendAsync(request, timeoutCts.Token);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(timeoutCts.Token);
                _logger.LogWarning("OpenAI API error ({StatusCode}): {Error}", response.StatusCode, errorContent);
                return default;
            }

            var responseJson = await response.Content.ReadAsStringAsync(timeoutCts.Token);
            using var doc = JsonDocument.Parse(responseJson);

            var choices = doc.RootElement.GetProperty("choices");
            if (choices.GetArrayLength() == 0) return default;

            var messageContent = choices[0].GetProperty("message").GetProperty("content").GetString();
            if (string.IsNullOrWhiteSpace(messageContent)) return default;

            var json = ExtractJson(messageContent);
            if (string.IsNullOrWhiteSpace(json)) return default;

            _logger.LogInformation("OpenAI extracted JSON: {Json}", json);

            return JsonSerializer.Deserialize<T>(json, JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling OpenAI API.");
            return default;
        }
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

        // Support both arrays and objects
        var firstObject = trimmed.IndexOf('{');
        var firstArray = trimmed.IndexOf('[');
        var lastObject = trimmed.LastIndexOf('}');
        var lastArray = trimmed.LastIndexOf(']');

        var isObject = firstObject >= 0 && lastObject > firstObject && (firstArray < 0 || firstObject < firstArray);
        var isArray = firstArray >= 0 && lastArray > firstArray && (firstObject < 0 || firstArray < firstObject);

        if (isObject) return trimmed[firstObject..(lastObject + 1)];
        if (isArray) return trimmed[firstArray..(lastArray + 1)];

        return null;
    }

    private static string GetSchemaDescription(Type type)
    {
        if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(List<>))
        {
            return "A flat JSON array of " + type.GetGenericArguments()[0].Name.ToLower() + "s. Example: [\"item1\", \"item2\"]";
        }
        
        var props = type.GetProperties();
        var schema = "{\n";
        foreach (var prop in props)
        {
            var typeName = prop.PropertyType.Name;
            if (prop.PropertyType.IsGenericType && prop.PropertyType.GetGenericTypeDefinition() == typeof(List<>))
            {
                typeName = "Array of " + prop.PropertyType.GetGenericArguments()[0].Name;
            }
            // camelCase property name
            var camelCaseName = char.ToLowerInvariant(prop.Name[0]) + prop.Name.Substring(1);
            schema += $"  \"{camelCaseName}\": \"{typeName}\",\n";
        }
        schema += "}";
        return schema;
    }
}
