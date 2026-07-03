using RecruitmentPlatform.Core.Entities;

namespace RecruitmentPlatform.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<Job> Jobs { get; }
    IRepository<Application> Applications { get; }
    IRepository<User> Users { get; }
    IRepository<CandidateProfile> CandidateProfiles { get; }
    Task<int> SaveChangesAsync();
}