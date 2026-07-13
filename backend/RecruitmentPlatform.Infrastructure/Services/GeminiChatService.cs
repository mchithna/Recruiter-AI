using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class GeminiChatService : IAiChatService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly ILogger<GeminiChatService> _logger;

    public GeminiChatService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiChatService> logger)
    {
        _httpClient = httpClient;
        _apiKey = configuration["GeminiSettings:ApiKey"] ?? string.Empty;
        _logger = logger;
    }

    public async Task<string> ProcessMessageAsync(ChatSession session, string userMessage)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("Gemini API Key is missing. Returning a mocked response.");
            return "This is a mocked response since the Gemini API key is missing from .env.";
        }

        try
        {
            var systemInstruction = "You are a helpful recruitment platform AI assistant. " +
                                    "Your job is to help users manage candidates, jobs, and applications on the platform. " +
                                    $"The current date and time is {DateTime.Now:yyyy-MM-dd HH:mm:ss}.";

            var contents = new List<object>();

            // Add previous messages (simplified mapping)
            foreach (var msg in session.ChatMessages.OrderBy(m => m.SentAt))
            {
                contents.Add(new
                {
                    role = msg.Role.ToLower() == "ai" ? "model" : "user",
                    parts = new[] { new { text = msg.Content } }
                });
            }

            // Ensure the latest message is also added if not already in session.ChatMessages
            // Actually, we should assume the session.ChatMessages ALREADY contains the user message,
            // or the controller adds it before calling this. We will assume the controller adds it.

            var requestBody = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = systemInstruction } }
                },
                contents = contents
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";
            var response = await _httpClient.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("Gemini API Error: {StatusCode} - {Body}", response.StatusCode, errorBody);
                return "I'm sorry, I encountered an error while processing your request.";
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            var jsonDocument = JsonDocument.Parse(responseBody);
            
            // Extract the generated text
            var generatedText = jsonDocument.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return generatedText ?? "I'm sorry, I could not generate a response.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini API");
            return "An internal error occurred while reaching the AI service.";
        }
    }
}
