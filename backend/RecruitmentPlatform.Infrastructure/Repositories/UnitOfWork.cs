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
    private IRepository<ApplicationStatusHistory>? _applicationStatusHistories;

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

    public IRepository<ApplicationStatusHistory> ApplicationStatusHistories => _applicationStatusHistories ??= new Repository<ApplicationStatusHistory>(_context);



    private IRepository<AuditLog>? _auditLogs;
    private IRepository<Notification>? _notifications;
    private IRepository<PracticeQuestion>? _practiceQuestions;
    private IRepository<PracticeSession>? _practiceSessions;
    private IRepository<PracticeSessionQuestion>? _practiceSessionQuestions;
    private IRepository<Skill>? _skills;

    public IRepository<UserInvitation> UserInvitations => _userInvitations ??= new Repository<UserInvitation>(_context);
    public IRepository<AuditLog> AuditLogs => _auditLogs ??= new Repository<AuditLog>(_context);
    public IRepository<Notification> Notifications => _notifications ??= new Repository<Notification>(_context);
    public IRepository<PracticeQuestion> PracticeQuestions => _practiceQuestions ??= new Repository<PracticeQuestion>(_context);
    public IRepository<PracticeSession> PracticeSessions => _practiceSessions ??= new Repository<PracticeSession>(_context);
    public IRepository<PracticeSessionQuestion> PracticeSessionQuestions => _practiceSessionQuestions ??= new Repository<PracticeSessionQuestion>(_context);
    public IRepository<Skill> Skills => _skills ??= new Repository<Skill>(_context);

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