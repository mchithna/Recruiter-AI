namespace RecruitmentPlatform.Core.Entities;

public class CandidateAnswer
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    public string? Transcript { get; set; }
    public string? InterviewerNotes { get; set; }
    public string? AnswerSummary { get; set; }
    public int? RelevanceScore { get; set; }
    public int? DepthScore { get; set; }
    public int? ClarityScore { get; set; }
    public string? Confidence { get; set; }
    public string? PotentialConcern { get; set; }
    public string? SuggestedAction { get; set; }
    public string? SuggestedFollowUpQuestion { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual InterviewQuestion Question { get; set; } = null!;
}
