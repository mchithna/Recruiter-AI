using RecruitmentPlatform.Core.Entities;

namespace RecruitmentPlatform.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<Job> Jobs { get; }
    IRepository<Application> Applications { get; }
    IRepository<User> Users { get; }
    IRepository<Company> Companies { get; }
    IRepository<Department> Departments { get; }
    IRepository<CandidateProfile> CandidateProfiles { get; }
    IRepository<Role> Roles { get; }
    IRepository<ApplicationStatusHistory> ApplicationStatusHistories { get; }

    IRepository<UserInvitation> UserInvitations { get; }
    IRepository<AuditLog> AuditLogs { get; }
    IRepository<Notification> Notifications { get; }
    IRepository<PracticeQuestion> PracticeQuestions { get; }
    IRepository<PracticeSession> PracticeSessions { get; }
    IRepository<PracticeSessionQuestion> PracticeSessionQuestions { get; }
    IRepository<Skill> Skills { get; }
    Task<int> SaveChangesAsync();
}