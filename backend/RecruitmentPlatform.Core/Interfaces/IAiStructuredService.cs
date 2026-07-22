namespace RecruitmentPlatform.Core.Interfaces;

public interface IAiStructuredService
{
    Task<T?> GenerateJsonAsync<T>(
        string systemInstruction,
        string userPrompt,
        int maxOutputTokens = 1200,
        CancellationToken cancellationToken = default);
}
