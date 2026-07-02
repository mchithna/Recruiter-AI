namespace RecruitmentPlatform.Core.Entities;

public class ChatSession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? SessionContext { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }

    public virtual User User { get; set; } = null!;
    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
}