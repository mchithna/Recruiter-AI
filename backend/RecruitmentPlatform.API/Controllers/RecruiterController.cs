using System.Linq.Expressions;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/recruiter")]
[Authorize(Roles = "Recruiter")]
public class RecruiterController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RecruiterController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var jobs = await RecruiterJobs(companyId)
            .Select(j => new RecruiterJobDto
            {
                Id = j.Id,
                Title = j.Title,
                Description = j.Description,
                Requirements = j.Requirements,
                EmploymentType = j.EmploymentType,
                WorkMode = j.WorkMode,
                Location = j.Location,
                ApplicationDeadline = j.ApplicationDeadline,
                Status = j.Status,
                DepartmentName = j.Department.Name,
                CreatedAt = j.CreatedAt,
                ApplicationCount = j.Applications.Count
            })
            .ToListAsync(cancellationToken);

        var applications = await RecruiterApplications(companyId)
            .OrderByDescending(a => a.AppliedAt)
            .Take(100)
            .Select(ToApplicationListDtoExpr)
            .ToListAsync(cancellationToken);

        var interviews = await _context.Interviews
            .AsNoTracking()
            .Where(i => i.Application.Job.Department.CompanyId == companyId)
            .OrderBy(i => i.ScheduledTime)
            .Take(100)
            .Select(i => new RecruiterInterviewDto
            {
                Id = i.Id,
                ApplicationId = i.ApplicationId,
                CandidateName = i.Application.Candidate.FirstName + " " + i.Application.Candidate.LastName,
                JobTitle = i.Application.Job.Title,
                InterviewType = i.InterviewType,
                ScheduledTime = i.ScheduledTime,
                DurationMinutes = i.DurationMinutes,
                MeetingLink = i.MeetingLink,
                Status = i.Status,
                Notes = i.Notes
            })
            .ToListAsync(cancellationToken);

        return Ok(new { jobs, applications, interviews });
    }

    [HttpGet("jobs")]
    public async Task<ActionResult<List<RecruiterJobDto>>> GetJobs(CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        return await RecruiterJobs(companyId)
            .OrderByDescending(j => j.CreatedAt)
            .Select(j => new RecruiterJobDto
            {
                Id = j.Id,
                Title = j.Title,
                Description = j.Description,
                Requirements = j.Requirements,
                EmploymentType = j.EmploymentType,
                WorkMode = j.WorkMode,
                Location = j.Location,
                ApplicationDeadline = j.ApplicationDeadline,
                Status = j.Status,
                DepartmentName = j.Department.Name,
                CreatedAt = j.CreatedAt,
                ApplicationCount = j.Applications.Count
            })
            .ToListAsync(cancellationToken);
    }

    [HttpPost("jobs")]
    public async Task<ActionResult<RecruiterJobDto>> CreateJob([FromBody] SaveRecruiterJobDto request, CancellationToken cancellationToken)
    {
        if (!TryGetCompanyId(out var companyId)) return MissingRecruiterCompany();
        if (!TryGetUserId(out var recruiterId)) return Unauthorized(new { message = "Your recruiter profile could not be verified. Please sign out and sign in again." });

        var departmentId = await ResolveDepartmentId(companyId, cancellationToken);
        if (departmentId is null)
        {
            return BadRequest(new { message = "Create a company department before creating recruiter jobs." });
        }

        var job = new Job
        {
            DepartmentId = departmentId.Value,
            RecruiterId = recruiterId,
            Title = Clamp(request.Title, 255),
            Description = Clamp(request.Description, 5000),
            Requirements = Clamp(request.Requirements, 5000),
            EmploymentType = Clamp(request.EmploymentType, 50),
            WorkMode = Clamp(request.WorkMode, 50),
            Location = Clamp(request.Location, 255),
            ApplicationDeadline = ParseDate(request.ApplicationDeadline),
            Status = "Draft",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetJobs), null, new RecruiterJobDto
        {
            Id = job.Id,
            Title = job.Title,
            Description = job.Description,
            Requirements = job.Requirements,
            EmploymentType = job.EmploymentType,
            WorkMode = job.WorkMode,
            Location = job.Location,
            ApplicationDeadline = job.ApplicationDeadline,
            Status = job.Status,
            CreatedAt = job.CreatedAt
        });
    }

    [HttpPut("jobs/{jobId:int}")]
    public async Task<IActionResult> UpdateJob(int jobId, [FromBody] SaveRecruiterJobDto request, CancellationToken cancellationToken)
    {
        if (!TryGetCompanyId(out var companyId)) return MissingRecruiterCompany();

        var job = await _context.Jobs
            .Include(j => j.Department)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.Department.CompanyId == companyId, cancellationToken);

        if (job == null) return NotFound(new { message = "Job not found." });

        job.Title = Clamp(request.Title, 255);
        job.Description = Clamp(request.Description, 5000);
        job.Requirements = Clamp(request.Requirements, 5000);
        job.EmploymentType = Clamp(request.EmploymentType, 50);
        job.WorkMode = Clamp(request.WorkMode, 50);
        job.Location = Clamp(request.Location, 255);
        job.ApplicationDeadline = ParseDate(request.ApplicationDeadline);
        job.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("jobs/{jobId:int}/applications")]
    public async Task<ActionResult<List<RecruiterApplicationListDto>>> GetApplicationsForJob(int jobId, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var hasAccess = await RecruiterJobs(companyId).AnyAsync(j => j.Id == jobId, cancellationToken);
        if (!hasAccess) return NotFound(new { message = "Job not found." });

        return await RecruiterApplications(companyId)
            .Where(a => a.JobId == jobId)
            .OrderByDescending(a => a.AiMatchScore ?? 0)
            .ThenByDescending(a => a.AppliedAt)
            .Select(ToApplicationListDtoExpr)
            .ToListAsync(cancellationToken);
    }

    [HttpGet("applications/{applicationId:int}")]
    public async Task<ActionResult<RecruiterApplicationDetailDto>> GetApplication(int applicationId, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var application = await RecruiterApplications(companyId)
            .Include(a => a.AiScreeningResult)
            .Include(a => a.Document)
            .Include(a => a.Candidate).ThenInclude(c => c.CandidateProfile)!.ThenInclude(p => p.CandidateEducations)
            .Include(a => a.Candidate).ThenInclude(c => c.CandidateProfile)!.ThenInclude(p => p.CandidateWorkExperiences)
            .Include(a => a.Candidate).ThenInclude(c => c.CandidateProfile)!.ThenInclude(p => p.CandidateSkills).ThenInclude(s => s.Skill)
            .Include(a => a.Interviews)
            .Include(a => a.CommunicationMessages)
            .FirstOrDefaultAsync(a => a.Id == applicationId, cancellationToken);

        if (application == null) return NotFound(new { message = "Application not found." });

        return ToApplicationDetailDto(application);
    }

    [HttpGet("messages/conversations")]
    public async Task<ActionResult<List<RecruiterConversationDto>>> GetConversations(CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        return await _context.CommunicationMessages
            .AsNoTracking()
            .Where(m => m.Application.Job.Department.CompanyId == companyId)
            .GroupBy(m => m.ApplicationId)
            .Select(g => g.OrderByDescending(m => m.SentAt).First())
            .OrderByDescending(m => m.SentAt)
            .Select(m => new RecruiterConversationDto
            {
                ApplicationId = m.ApplicationId,
                CandidateName = m.Application.Candidate.FirstName + " " + m.Application.Candidate.LastName,
                JobTitle = m.Application.Job.Title,
                Body = m.Body,
                SentAt = m.SentAt,
                Unread = !m.IsRead && m.SenderId == m.Application.CandidateId
            })
            .ToListAsync(cancellationToken);
    }

    private IQueryable<Job> RecruiterJobs(int companyId) =>
        _context.Jobs.AsNoTracking().Where(j => j.Department.CompanyId == companyId);

    private IQueryable<Application> RecruiterApplications(int companyId) =>
        _context.Applications.AsNoTracking().Where(a => a.Job.Department.CompanyId == companyId);

    private int GetCompanyId()
    {
        var value = User.FindFirst("company_id")?.Value;
        if (int.TryParse(value, out var companyId)) return companyId;
        throw new UnauthorizedAccessException("Company ID claim is missing or invalid.");
    }

    private int GetUserId()
    {
        var value = User.FindFirst("app_user_id")?.Value;
        if (int.TryParse(value, out var userId)) return userId;
        throw new UnauthorizedAccessException("User ID claim is missing or invalid.");
    }

    private bool TryGetCompanyId(out int companyId)
    {
        var value = User.FindFirst("company_id")?.Value;
        return int.TryParse(value, out companyId);
    }

    private bool TryGetUserId(out int userId)
    {
        var value = User.FindFirst("app_user_id")?.Value;
        return int.TryParse(value, out userId);
    }

    private UnauthorizedObjectResult MissingRecruiterCompany() =>
        Unauthorized(new { message = "Your recruiter profile is not linked to a company. Please accept your company invitation again or ask your admin to resend it." });

    private async Task<int?> ResolveDepartmentId(int companyId, CancellationToken cancellationToken)
    {
        if (int.TryParse(User.FindFirst("department_id")?.Value, out var departmentId))
        {
            var exists = await _context.Departments.AnyAsync(d => d.Id == departmentId && d.CompanyId == companyId, cancellationToken);
            if (exists) return departmentId;
        }

        return await _context.Departments
            .Where(d => d.CompanyId == companyId)
            .OrderBy(d => d.Id)
            .Select(d => (int?)d.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private static DateOnly? ParseDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return DateTime.TryParse(value, out var date) ? DateOnly.FromDateTime(date) : null;
    }

    private static string Clamp(string? value, int maxLength)
    {
        var text = (value ?? string.Empty).Trim();
        return text.Length <= maxLength ? text : text[..maxLength];
    }

    private static Expression<Func<Application, RecruiterApplicationListDto>> ToApplicationListDtoExpr => a => new RecruiterApplicationListDto
    {
        Id = a.Id,
        JobId = a.JobId,
        JobTitle = a.Job.Title,
        CandidateName = a.Candidate.FirstName + " " + a.Candidate.LastName,
        AppliedAt = a.AppliedAt,
        Status = a.Status,
        AiMatchScore = a.AiMatchScore
    };

    private static RecruiterApplicationDetailDto ToApplicationDetailDto(Application a)
    {
        var profile = a.Candidate.CandidateProfile;
        return new RecruiterApplicationDetailDto
        {
            Id = a.Id,
            JobId = a.JobId,
            JobTitle = a.Job.Title,
            CandidateName = a.Candidate.FirstName + " " + a.Candidate.LastName,
            AppliedAt = a.AppliedAt,
            Status = a.Status,
            AiMatchScore = a.AiMatchScore,
            CoverLetterText = a.CoverLetterText,
            CandidateProfile = profile == null ? null : new RecruiterCandidateProfileDto
            {
                SummaryText = profile.SummaryText,
                PortfolioUrl = profile.PortfolioUrl,
                LinkedinUrl = profile.LinkedinUrl,
                GithubUrl = profile.GithubUrl,
                LocationCity = profile.LocationCity,
                YearsOfExperience = profile.YearsOfExperience,
                FirstName = a.Candidate.FirstName,
                LastName = a.Candidate.LastName,
                Skills = profile.CandidateSkills.Select(s => new RecruiterCandidateSkillDto
                {
                    Name = s.Skill.Name,
                    ProficiencyLevel = s.ProficiencyLevel,
                    YearsOfExperience = s.YearsOfExperience,
                    ExtractedByAi = s.ExtractedByAi
                }).ToList(),
                Education = profile.CandidateEducations.Select(e => new RecruiterCandidateEducationDto
                {
                    InstitutionName = e.InstitutionName,
                    Degree = e.Degree,
                    FieldOfStudy = e.FieldOfStudy,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsCurrent = e.IsCurrent,
                    Grade = e.Grade
                }).ToList(),
                WorkExperience = profile.CandidateWorkExperiences.Select(e => new RecruiterCandidateExperienceDto
                {
                    CompanyName = e.CompanyName,
                    JobTitle = e.JobTitle,
                    Location = e.Location,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsCurrent = e.IsCurrent,
                    Description = e.Description
                }).ToList(),
                DocumentName = a.Document?.FileName
            },
            ScreeningResult = a.AiScreeningResult == null ? null : new RecruiterAiScreeningDto
            {
                OverallScore = a.AiScreeningResult.OverallScore,
                SkillsMatchScore = a.AiScreeningResult.SkillsMatchScore,
                ExperienceMatchScore = a.AiScreeningResult.ExperienceMatchScore,
                EducationMatchScore = a.AiScreeningResult.EducationMatchScore,
                ScreeningSummary = a.AiScreeningResult.ScreeningSummary,
                AiRank = a.AiScreeningResult.AiRank,
                ProcessedAt = a.AiScreeningResult.ProcessedAt
            },
            Interviews = a.Interviews.OrderByDescending(i => i.ScheduledTime).Select(i => new RecruiterInterviewDto
            {
                Id = i.Id,
                ApplicationId = i.ApplicationId,
                CandidateName = a.Candidate.FirstName + " " + a.Candidate.LastName,
                JobTitle = a.Job.Title,
                InterviewType = i.InterviewType,
                ScheduledTime = i.ScheduledTime,
                DurationMinutes = i.DurationMinutes,
                MeetingLink = i.MeetingLink,
                Status = i.Status,
                Notes = i.Notes
            }).ToList(),
            Messages = a.CommunicationMessages.OrderBy(m => m.SentAt).Select(m => new RecruiterMessageDto
            {
                Id = m.Id,
                Sender = m.SenderId == a.CandidateId ? "Candidate" : "Recruiter",
                Body = m.Body,
                SentAt = m.SentAt
            }).ToList()
        };
    }
}

public class SaveRecruiterJobDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Requirements { get; set; }
    public string? EmploymentType { get; set; }
    public string? WorkMode { get; set; }
    public string? Location { get; set; }
    public string? ApplicationDeadline { get; set; }
}

public class RecruiterJobDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string? Requirements { get; set; }
    public string? EmploymentType { get; set; }
    public string? WorkMode { get; set; }
    public string? Location { get; set; }
    public DateOnly? ApplicationDeadline { get; set; }
    public string Status { get; set; } = "";
    public string? DepartmentName { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ApplicationCount { get; set; }
}

public class RecruiterApplicationListDto
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string JobTitle { get; set; } = "";
    public string CandidateName { get; set; } = "";
    public DateTime AppliedAt { get; set; }
    public string Status { get; set; } = "";
    public decimal? AiMatchScore { get; set; }
}

public class RecruiterApplicationDetailDto : RecruiterApplicationListDto
{
    public string? CoverLetterText { get; set; }
    public RecruiterCandidateProfileDto? CandidateProfile { get; set; }
    public RecruiterAiScreeningDto? ScreeningResult { get; set; }
    public List<RecruiterInterviewDto> Interviews { get; set; } = new();
    public List<RecruiterMessageDto> Messages { get; set; } = new();
}

public class RecruiterCandidateProfileDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? SummaryText { get; set; }
    public string? PortfolioUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? LocationCity { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? DocumentName { get; set; }
    public List<RecruiterCandidateSkillDto> Skills { get; set; } = new();
    public List<RecruiterCandidateEducationDto> Education { get; set; } = new();
    public List<RecruiterCandidateExperienceDto> WorkExperience { get; set; } = new();
}

public class RecruiterCandidateSkillDto
{
    public string Name { get; set; } = "";
    public string? ProficiencyLevel { get; set; }
    public int? YearsOfExperience { get; set; }
    public bool ExtractedByAi { get; set; }
}

public class RecruiterCandidateEducationDto
{
    public string InstitutionName { get; set; } = "";
    public string Degree { get; set; } = "";
    public string FieldOfStudy { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Grade { get; set; }
}

public class RecruiterCandidateExperienceDto
{
    public string CompanyName { get; set; } = "";
    public string JobTitle { get; set; } = "";
    public string? Location { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Description { get; set; }
}

public class RecruiterAiScreeningDto
{
    public decimal OverallScore { get; set; }
    public decimal? SkillsMatchScore { get; set; }
    public decimal? ExperienceMatchScore { get; set; }
    public decimal? EducationMatchScore { get; set; }
    public string? ScreeningSummary { get; set; }
    public int? AiRank { get; set; }
    public DateTime ProcessedAt { get; set; }
}

public class RecruiterInterviewDto
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public string CandidateName { get; set; } = "";
    public string JobTitle { get; set; } = "";
    public string InterviewType { get; set; } = "";
    public DateTime ScheduledTime { get; set; }
    public int DurationMinutes { get; set; }
    public string? MeetingLink { get; set; }
    public string Status { get; set; } = "";
    public string? Notes { get; set; }
}

public class RecruiterMessageDto
{
    public int Id { get; set; }
    public string Sender { get; set; } = "";
    public string Body { get; set; } = "";
    public DateTime SentAt { get; set; }
}

public class RecruiterConversationDto
{
    public int ApplicationId { get; set; }
    public string CandidateName { get; set; } = "";
    public string JobTitle { get; set; } = "";
    public string Body { get; set; } = "";
    public DateTime SentAt { get; set; }
    public bool Unread { get; set; }
}
