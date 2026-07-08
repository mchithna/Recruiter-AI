namespace RecruitmentPlatform.Core.Entities;

public class CandidateSkill
{
    public int CandidateId { get; set; }
    public int SkillId { get; set; }
    public string? ProficiencyLevel { get; set; }
    public int? YearsOfExperience { get; set; }
    public bool ExtractedByAi { get; set; }

    public virtual CandidateProfile Candidate { get; set; } = null!;
    public virtual Skill Skill { get; set; } = null!;
}