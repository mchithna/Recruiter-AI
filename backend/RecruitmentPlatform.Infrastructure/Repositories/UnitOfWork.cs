using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IRepository<Job>? _jobs;
    private IRepository<Application>? _applications;
    private IRepository<User>? _users;
    private IRepository<CandidateProfile>? _candidateProfiles;
    private bool _disposed;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IRepository<Job> Jobs => _jobs ??= new Repository<Job>(_context);

    public IRepository<Application> Applications => _applications ??= new Repository<Application>(_context);

    public IRepository<User> Users => _users ??= new Repository<User>(_context);

    public IRepository<CandidateProfile> CandidateProfiles => _candidateProfiles ??= new Repository<CandidateProfile>(_context);

    public Task<int> SaveChangesAsync()
    {
        return _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed)
        {
            return;
        }

        if (disposing)
        {
            _context.Dispose();
        }

        _disposed = true;
    }
}