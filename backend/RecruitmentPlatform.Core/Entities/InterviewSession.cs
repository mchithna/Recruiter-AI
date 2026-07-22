namespace RecruitmentPlatform.Core.Entities;

public class InterviewSession
{
    public int Id { get; set; }
    public int InterviewId { get; set; }
    public int ApplicationId { get; set; }
    public int CandidateId { get; set; }
    public int JobId { get; set; }
    public int StartedByUserId { get; set; }
    public string StartedByRole { get; set; } = null!;
    public string Status { get; set; } = "Live";
    public string QuestionMode { get; set; } = "Adaptive";
    public string Difficulty { get; set; } = "Intermediate";
    public bool ConsentRecorded { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }

    public virtual Interview Interview { get; set; } = null!;
    public virtual Application Application { get; set; } = null!;
    public virtual User Candidate { get; set; } = null!;
    public virtual Job Job { get; set; } = null!;
    public virtual User StartedByUser { get; set; } = null!;
    public virtual ICollection<InterviewQuestion> Questions { get; set; } = new List<InterviewQuestion>();
    public virtual ICollection<InterviewAiInsight> AiInsights { get; set; } = new List<InterviewAiInsight>();
}
