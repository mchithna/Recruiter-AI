namespace RecruitmentPlatform.Core.Entities;

public class ChatMessage
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public string Role { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime SentAt { get; set; }

    public virtual ChatSession Session { get; set; } = null!;
}