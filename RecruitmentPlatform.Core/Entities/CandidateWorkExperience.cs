namespace RecruitmentPlatform.Core.Entities;

public class CandidateWorkExperience
{
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public string CompanyName { get; set; } = null!;
    public string JobTitle { get; set; } = null!;
    public string? Location { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Description { get; set; }

    public virtual CandidateProfile Candidate { get; set; } = null!;
}