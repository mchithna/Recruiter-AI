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
    private IRepository<Company>? _companies;
    private IRepository<Department>? _departments;
    private IRepository<CandidateProfile>? _candidateProfiles;
    private IRepository<Role>? _roles;

    private IRepository<UserInvitation>? _userInvitations;
    private bool _disposed;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IRepository<Job> Jobs => _jobs ??= new Repository<Job>(_context);

    public IRepository<Application> Applications => _applications ??= new Repository<Application>(_context);

    public IRepository<User> Users => _users ??= new Repository<User>(_context);

    public IRepository<Company> Companies => _companies ??= new Repository<Company>(_context);

    public IRepository<Department> Departments => _departments ??= new Repository<Department>(_context);

    public IRepository<CandidateProfile> CandidateProfiles => _candidateProfiles ??= new Repository<CandidateProfile>(_context);

    public IRepository<Role> Roles => _roles ??= new Repository<Role>(_context);



    private IRepository<AuditLog>? _auditLogs;
    public IRepository<UserInvitation> UserInvitations => _userInvitations ??= new Repository<UserInvitation>(_context);
    public IRepository<AuditLog> AuditLogs => _auditLogs ??= new Repository<AuditLog>(_context);

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