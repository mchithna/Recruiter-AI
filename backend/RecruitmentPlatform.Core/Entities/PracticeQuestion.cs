namespace RecruitmentPlatform.Core.Entities;

public class PracticeQuestion
{
    public int Id { get; set; }
    public int SkillId { get; set; }
    public string Difficulty { get; set; } = null!;
    public string QuestionText { get; set; } = null!;
    public string OptionA { get; set; } = null!;
    public string OptionB { get; set; } = null!;
    public string OptionC { get; set; } = null!;
    public string OptionD { get; set; } = null!;
    public string CorrectOption { get; set; } = null!; // A/B/C/D
    public string ExplanationText { get; set; } = null!;
    public int ReportCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    public virtual Skill Skill { get; set; } = null!;
    public virtual ICollection<PracticeSessionQuestion> PracticeSessionQuestions { get; set; } = new List<PracticeSessionQuestion>();
}
