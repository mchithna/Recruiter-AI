namespace RecruitmentPlatform.Core.Entities;

public class Application
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public int CandidateId { get; set; }
    public int? DocumentId { get; set; }
    public string? CoverLetterText { get; set; }
    public string Status { get; set; } = null!;
    public decimal? AiMatchScore { get; set; }
    public string? RecruiterNotes { get; set; }
    public DateTime AppliedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual Job Job { get; set; } = null!;
    public virtual User Candidate { get; set; } = null!;
    public virtual CandidateDocument? Document { get; set; }
    public virtual AiScreeningResult? AiScreeningResult { get; set; }
    public virtual Offer? Offer { get; set; }
    public virtual ICollection<ApplicationStatusHistory> ApplicationStatusHistories { get; set; } = new List<ApplicationStatusHistory>();
    public virtual ICollection<CommunicationMessage> CommunicationMessages { get; set; } = new List<CommunicationMessage>();
    public virtual ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}