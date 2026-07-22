using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrEmpty(apiKey)) {
            Console.WriteLine("API key is missing.");
            return;
        }

        var systemInstruction = "You are a recruitment assistant. \n\nCRITICAL: You MUST return ONLY raw, valid JSON. Do not include markdown formatting or backticks. Ensure your JSON exactly matches the requested structure. If a field expects a string, do NOT return an array.";
        var userPrompt = "Extract a comprehensive, flat list of professional skills from this resume text. Return only the skill names as strings. Resume Text: John Doe. React developer with C# experience.";

        var requestBody = new
        {
            model = "gpt-4o-mini",
            messages = new[]
            {
                new { role = "system", content = systemInstruction },
                new { role = "user", content = userPrompt }
            },
            max_completion_tokens = 1000,
            temperature = 0.2
        };

        var JsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        var jsonBody = JsonSerializer.Serialize(requestBody, JsonOptions);
        using var httpClient = new HttpClient();
        using var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var response = await httpClient.SendAsync(request);
        var responseJson = await response.Content.ReadAsStringAsync();
        Console.WriteLine("RAW RESPONSE:");
        Console.WriteLine(responseJson);

        using var doc = JsonDocument.Parse(responseJson);
        var messageContent = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        
        Console.WriteLine("\nMESSAGE CONTENT:");
        Console.WriteLine(messageContent);

        var json = ExtractJson(messageContent);
        Console.WriteLine("\nEXTRACTED JSON:");
        Console.WriteLine(json);

        try {
            var result = JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(json, JsonOptions);
            Console.WriteLine($"\nDESERIALIZED OK! Count: {result?.Count}");
            foreach (var r in result) Console.WriteLine($"- {r}");
        }
        catch (Exception ex) {
            Console.WriteLine($"\nDESERIALIZE EXCEPTION: {ex.Message}");
        }
    }

    private static string ExtractJson(string text)
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
        var firstArray = trimmed.IndexOf('[');
        var lastObject = trimmed.LastIndexOf('}');
        var lastArray = trimmed.LastIndexOf(']');

        var isObject = firstObject >= 0 && lastObject > firstObject && (firstArray < 0 || firstObject < firstArray);
        var isArray = firstArray >= 0 && lastArray > firstArray && (firstObject < 0 || firstArray < firstObject);

        if (isObject) return trimmed[firstObject..(lastObject + 1)];
        if (isArray) return trimmed[firstArray..(lastArray + 1)];

        return null;
    }
}
