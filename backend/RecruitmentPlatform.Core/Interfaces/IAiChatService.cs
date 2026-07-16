using RecruitmentPlatform.Core.Entities;

namespace RecruitmentPlatform.Core.Interfaces;

public interface IAiChatService
{
    Task<string> ProcessMessageAsync(ChatSession session, string userMessage);
}
