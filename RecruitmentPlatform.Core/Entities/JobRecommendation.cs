namespace RecruitmentPlatform.Core.Entities;

public class JobRecommendation
{
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public int JobId { get; set; }
    public decimal MatchScore { get; set; }
    public string? RecommendationReason { get; set; }
    public bool IsDismissed { get; set; }
    public DateTime GeneratedAt { get; set; }

    public virtual CandidateProfile Candidate { get; set; } = null!;
    public virtual Job Job { get; set; } = null!;
}