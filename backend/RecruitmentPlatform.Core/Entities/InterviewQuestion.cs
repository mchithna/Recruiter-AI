namespace RecruitmentPlatform.Core.Entities;

public class InterviewQuestion
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public string QuestionText { get; set; } = null!;
    public string? QuestionType { get; set; }
    public string? Category { get; set; }
    public string? Skill { get; set; }
    public string? Difficulty { get; set; }
    public string? Reason { get; set; }
    public string? ExpectedPointsJson { get; set; }
    public DateTime GeneratedAt { get; set; }
    public DateTime? AskedAt { get; set; }
    public string Status { get; set; } = "Generated";

    public virtual InterviewSession Session { get; set; } = null!;
    public virtual ICollection<CandidateAnswer> CandidateAnswers { get; set; } = new List<CandidateAnswer>();
}
