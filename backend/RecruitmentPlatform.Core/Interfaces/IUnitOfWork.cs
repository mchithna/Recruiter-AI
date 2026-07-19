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

    IRepository<UserInvitation> UserInvitations { get; }
    IRepository<AuditLog> AuditLogs { get; }
    Task<int> SaveChangesAsync();
}