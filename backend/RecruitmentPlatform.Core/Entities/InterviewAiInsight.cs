namespace RecruitmentPlatform.Core.Entities;

public class InterviewAiInsight
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public string InsightType { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public virtual InterviewSession Session { get; set; } = null!;
}
