namespace RecruitmentPlatform.Core.Entities;

public class Notification
{
    public int Id { get; set; }
    public int RecipientId { get; set; }
    public string Type { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Body { get; set; } = null!;
    public string Channel { get; set; } = null!;
    public bool IsRead { get; set; }
    public string? RelatedEntityType { get; set; }
    public int? RelatedEntityId { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime? ReadAt { get; set; }

    public virtual User Recipient { get; set; } = null!;
}