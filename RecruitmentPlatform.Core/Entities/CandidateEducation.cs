namespace RecruitmentPlatform.Core.Entities;

public class CandidateEducation
{
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public string InstitutionName { get; set; } = null!;
    public string Degree { get; set; } = null!;
    public string FieldOfStudy { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Grade { get; set; }

    public virtual CandidateProfile Candidate { get; set; } = null!;
}