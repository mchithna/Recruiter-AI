using RecruitmentPlatform.Core.DTOs;

namespace RecruitmentPlatform.Core.Interfaces;

public interface IAiChatService
{
    Task<string> GenerateResponseAsync(ChatGenerationRequest request, CancellationToken cancellationToken = default);
}
