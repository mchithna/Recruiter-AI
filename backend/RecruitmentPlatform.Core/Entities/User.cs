namespace RecruitmentPlatform.Core.Entities;

public class User
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public int? CompanyId { get; set; }
    public int? DepartmentId { get; set; }
    public string Email { get; set; } = null!;
    public Guid SupabaseUserId { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }

    public virtual Role Role { get; set; } = null!;
    public virtual Company? Company { get; set; }
    public virtual Department? Department { get; set; }
    public virtual CandidateProfile? CandidateProfile { get; set; }
    public virtual ICollection<Application> CandidateApplications { get; set; } = new List<Application>();
    public virtual ICollection<ApplicationStatusHistory> ApplicationStatusHistories { get; set; } = new List<ApplicationStatusHistory>();
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public virtual ICollection<CalendarIntegration> CalendarIntegrations { get; set; } = new List<CalendarIntegration>();
    public virtual ICollection<ChatSession> ChatSessions { get; set; } = new List<ChatSession>();
    public virtual ICollection<CommunicationMessage> ReceivedCommunicationMessages { get; set; } = new List<CommunicationMessage>();
    public virtual ICollection<CommunicationMessage> SentCommunicationMessages { get; set; } = new List<CommunicationMessage>();
    public virtual ICollection<Evaluation> EvaluationsSubmitted { get; set; } = new List<Evaluation>();
    public virtual ICollection<Interview> InterviewsConducted { get; set; } = new List<Interview>();
    public virtual ICollection<Job> HiringManagerJobs { get; set; } = new List<Job>();
    public virtual ICollection<Job> RecruiterJobs { get; set; } = new List<Job>();
    public virtual ICollection<Notification> NotificationsReceived { get; set; } = new List<Notification>();
    public virtual ICollection<Offer> ManagedOffers { get; set; } = new List<Offer>();
    public virtual ICollection<Offer> InitiatedOffers { get; set; } = new List<Offer>();
    public virtual ICollection<UserInvitation> SentUserInvitations { get; set; } = new List<UserInvitation>();
}