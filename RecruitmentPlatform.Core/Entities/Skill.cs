namespace RecruitmentPlatform.Core.Entities;

public class Skill
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public virtual ICollection<CandidateSkill> CandidateSkills { get; set; } = new List<CandidateSkill>();
    public virtual ICollection<JobSkill> JobSkills { get; set; } = new List<JobSkill>();
}