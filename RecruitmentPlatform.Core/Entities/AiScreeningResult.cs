namespace RecruitmentPlatform.Core.Entities;

public class AiScreeningResult
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public decimal OverallScore { get; set; }
    public decimal? SkillsMatchScore { get; set; }
    public decimal? ExperienceMatchScore { get; set; }
    public decimal? EducationMatchScore { get; set; }
    public string? ScreeningSummary { get; set; }
    public int? AiRank { get; set; }
    public DateTime ProcessedAt { get; set; }

    public virtual Application Application { get; set; } = null!;
}