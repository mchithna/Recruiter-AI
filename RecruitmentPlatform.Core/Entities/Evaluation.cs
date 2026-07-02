namespace RecruitmentPlatform.Core.Entities;

public class Evaluation
{
    public int Id { get; set; }
    public int InterviewId { get; set; }
    public int EvaluatedBy { get; set; }
    public int OverallScore { get; set; }
    public string FeedbackText { get; set; } = null!;
    public string? StrengthsText { get; set; }
    public string? ConcernsText { get; set; }
    public bool HireRecommendation { get; set; }
    public DateTime SubmittedAt { get; set; }

    public virtual Interview Interview { get; set; } = null!;
    public virtual User EvaluatedByUser { get; set; } = null!;
}