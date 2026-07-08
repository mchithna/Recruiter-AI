namespace RecruitmentPlatform.Core.Entities;

public class Interview
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public int InterviewerId { get; set; }
    public string InterviewType { get; set; } = null!;
    public DateTime ScheduledTime { get; set; }
    public int DurationMinutes { get; set; }
    public string? MeetingLink { get; set; }
    public string? CalendarEventId { get; set; }
    public string Status { get; set; } = null!;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual Application Application { get; set; } = null!;
    public virtual User Interviewer { get; set; } = null!;
    public virtual Evaluation? Evaluation { get; set; }
}