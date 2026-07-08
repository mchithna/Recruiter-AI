namespace RecruitmentPlatform.Core.Entities;

public class CommunicationMessage
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public int SenderId { get; set; }
    public int RecipientId { get; set; }
    public string? Subject { get; set; }
    public string Body { get; set; } = null!;
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; }

    public virtual Application Application { get; set; } = null!;
    public virtual User Sender { get; set; } = null!;
    public virtual User Recipient { get; set; } = null!;
}