namespace RecruitmentPlatform.Core.Entities;

public class CandidateProfile
{
    public int UserId { get; set; }
    public string? SummaryText { get; set; }
    public string? PortfolioUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? LocationCity { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? ResumeParseStatus { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;
    public virtual ICollection<CandidateEducation> CandidateEducations { get; set; } = new List<CandidateEducation>();
    public virtual ICollection<CandidateWorkExperience> CandidateWorkExperiences { get; set; } = new List<CandidateWorkExperience>();
    public virtual ICollection<CandidateDocument> CandidateDocuments { get; set; } = new List<CandidateDocument>();
    public virtual ICollection<JobRecommendation> JobRecommendations { get; set; } = new List<JobRecommendation>();
    public virtual ICollection<CandidateSkill> CandidateSkills { get; set; } = new List<CandidateSkill>();
}