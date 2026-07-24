namespace RecruitmentPlatform.Core.Entities;

public class PracticeSession
{
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public string SourceType { get; set; } = null!; // Interview / Application / General
    public int? SourceInterviewId { get; set; }
    public int? SourceApplicationId { get; set; }
    public int? SourceSkillId { get; set; }
    public string Difficulty { get; set; } = null!; // Beginner / Intermediate / Advanced
    public int QuestionCount { get; set; } = 12;
    public int? Score { get; set; }
    public string Status { get; set; } = null!; // InProgress / Completed / Abandoned
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    public virtual User Candidate { get; set; } = null!;
    // Optional navigation properties depending on if they are mapped in AppDbContext
    public virtual Application? SourceApplication { get; set; }
    public virtual Skill? SourceSkill { get; set; }
    
    public virtual ICollection<PracticeSessionQuestion> PracticeSessionQuestions { get; set; } = new List<PracticeSessionQuestion>();
}
