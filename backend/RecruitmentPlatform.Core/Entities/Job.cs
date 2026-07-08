namespace RecruitmentPlatform.Core.Entities;

public class Job
{
    public int Id { get; set; }
    public int DepartmentId { get; set; }
    public int RecruiterId { get; set; }
    public int? HiringManagerId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? Requirements { get; set; }
    public string? EmploymentType { get; set; }
    public string? WorkMode { get; set; }
    public string? Location { get; set; }
    public DateOnly? ApplicationDeadline { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual Department Department { get; set; } = null!;
    public virtual User Recruiter { get; set; } = null!;
    public virtual User? HiringManager { get; set; }
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
    public virtual ICollection<JobRecommendation> JobRecommendations { get; set; } = new List<JobRecommendation>();
    public virtual ICollection<JobSkill> JobSkills { get; set; } = new List<JobSkill>();
}