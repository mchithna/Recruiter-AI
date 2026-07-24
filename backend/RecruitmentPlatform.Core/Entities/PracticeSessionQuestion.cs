namespace RecruitmentPlatform.Core.Entities;

public class PracticeSessionQuestion
{
    public int Id { get; set; }
    public int PracticeSessionId { get; set; }
    public int PracticeQuestionId { get; set; }
    public int QuestionOrder { get; set; }
    public string? CandidateAnswer { get; set; } // CHAR(1) nullable
    public bool? IsCorrect { get; set; }
    public DateTime? AnsweredAt { get; set; }

    public virtual PracticeSession PracticeSession { get; set; } = null!;
    public virtual PracticeQuestion PracticeQuestion { get; set; } = null!;
}
