using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/candidate")]
[Authorize(Roles = "Candidate")]
public class CandidateController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CandidateController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.CandidateProfile)!.ThenInclude(p => p.CandidateSkills).ThenInclude(s => s.Skill)
            .Include(u => u.CandidateProfile)!.ThenInclude(p => p.CandidateEducations)
            .Include(u => u.CandidateProfile)!.ThenInclude(p => p.CandidateWorkExperiences)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user?.CandidateProfile == null) return NotFound(new { message = "Candidate profile not found." });
        return Ok(ToProfileDto(user));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] CandidateProfileUpdateDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var profile = await _context.CandidateProfiles.FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        if (profile == null) return NotFound(new { message = "Candidate profile not found." });

        profile.SummaryText = Clamp(request.SummaryText, 5000);
        profile.PortfolioUrl = Clamp(request.PortfolioUrl, 255);
        profile.LinkedinUrl = Clamp(request.LinkedinUrl, 255);
        profile.GithubUrl = Clamp(request.GithubUrl, 255);
        profile.LocationCity = Clamp(request.LocationCity, 100);
        profile.YearsOfExperience = request.YearsOfExperience is < 0 or > 80 ? null : request.YearsOfExperience;
        profile.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("documents")]
    public async Task<IActionResult> GetDocuments(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var docs = await _context.CandidateDocuments
            .AsNoTracking()
            .Where(d => d.CandidateId == userId)
            .OrderByDescending(d => d.IsPrimary)
            .ThenByDescending(d => d.UploadedAt)
            .Select(d => new CandidateDocumentDto
            {
                Id = d.Id,
                DocumentType = d.DocumentType,
                FileName = d.FileName,
                FileUrl = d.FileUrl,
                FileSizeKb = d.FileSizeKb,
                IsPrimary = d.IsPrimary,
                UploadedAt = d.UploadedAt
            })
            .ToListAsync(cancellationToken);
        return Ok(docs);
    }

    [HttpPost("documents")]
    public async Task<IActionResult> AddDocument([FromBody] CandidateDocumentCreateDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(request.FileName)) return BadRequest(new { message = "Document file name is required." });
        var hasProfile = await _context.CandidateProfiles.AnyAsync(p => p.UserId == userId, cancellationToken);
        if (!hasProfile) return NotFound(new { message = "Candidate profile not found." });
        var hasAnyDoc = await _context.CandidateDocuments.AnyAsync(d => d.CandidateId == userId, cancellationToken);

        var doc = new CandidateDocument
        {
            CandidateId = userId,
            DocumentType = Clamp(request.DocumentType, 50) ?? "Resume",
            FileName = Clamp(request.FileName, 255) ?? "Resume",
            FileUrl = Clamp(request.FileUrl, 500) ?? "#",
            FileSizeKb = request.FileSizeKb is < 0 or > 51200 ? null : request.FileSizeKb,
            IsPrimary = request.IsPrimary || !hasAnyDoc,
            UploadedAt = DateTime.UtcNow
        };

        if (doc.IsPrimary)
        {
            await _context.CandidateDocuments.Where(d => d.CandidateId == userId).ExecuteUpdateAsync(s => s.SetProperty(d => d.IsPrimary, false), cancellationToken);
        }

        _context.CandidateDocuments.Add(doc);
        await _context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetDocuments), new { id = doc.Id }, doc);
    }

    [HttpPut("documents/{documentId:int}/primary")]
    public async Task<IActionResult> SetPrimaryDocument(int documentId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var exists = await _context.CandidateDocuments.AnyAsync(d => d.Id == documentId && d.CandidateId == userId, cancellationToken);
        if (!exists) return NotFound(new { message = "Document not found." });
        await _context.CandidateDocuments.Where(d => d.CandidateId == userId).ExecuteUpdateAsync(s => s.SetProperty(d => d.IsPrimary, d => d.Id == documentId), cancellationToken);
        return NoContent();
    }

    [HttpDelete("documents/{documentId:int}")]
    public async Task<IActionResult> DeleteDocument(int documentId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var doc = await _context.CandidateDocuments.FirstOrDefaultAsync(d => d.Id == documentId && d.CandidateId == userId, cancellationToken);
        if (doc == null) return NotFound(new { message = "Document not found." });
        _context.CandidateDocuments.Remove(doc);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("jobs")]
    public async Task<IActionResult> GetJobs([FromQuery] string? search, [FromQuery] string? employmentType, [FromQuery] string? workMode, CancellationToken cancellationToken)
    {
        var query = ActiveJobsQuery();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(j => j.Title.ToLower().Contains(term) || (j.Location != null && j.Location.ToLower().Contains(term)));
        }
        if (!string.IsNullOrWhiteSpace(employmentType)) query = query.Where(j => j.EmploymentType == employmentType);
        if (!string.IsNullOrWhiteSpace(workMode)) query = query.Where(j => j.WorkMode == workMode);

        var jobs = await query.OrderByDescending(j => j.CreatedAt).Take(100).Select(j => ToJobDto(j)).ToListAsync(cancellationToken);
        return Ok(jobs);
    }

    [HttpGet("jobs/{jobId:int}")]
    public async Task<IActionResult> GetJob(int jobId, CancellationToken cancellationToken)
    {
        var job = await ActiveJobsQuery().Where(j => j.Id == jobId).Select(j => ToJobDto(j)).FirstOrDefaultAsync(cancellationToken);
        return job == null ? NotFound(new { message = "Job not found." }) : Ok(job);
    }

    [HttpPost("jobs/{jobId:int}/apply")]
    public async Task<IActionResult> ApplyForJob(int jobId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var job = await ActiveJobsQuery().FirstOrDefaultAsync(j => j.Id == jobId, cancellationToken);
        if (job == null) return NotFound(new { message = "Job not found." });
        var exists = await _context.Applications.AnyAsync(a => a.JobId == jobId && a.CandidateId == userId, cancellationToken);
        if (exists) return Conflict(new { message = "You have already applied for this job." });
        var primaryDocId = await _context.CandidateDocuments.Where(d => d.CandidateId == userId && d.IsPrimary).Select(d => (int?)d.Id).FirstOrDefaultAsync(cancellationToken);
        if (!primaryDocId.HasValue) return BadRequest(new { message = "Upload a primary resume before applying." });

        var app = new Application
        {
            JobId = jobId,
            CandidateId = userId,
            DocumentId = primaryDocId,
            Status = "Applied",
            AppliedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Applications.Add(app);
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { app.Id, app.JobId, JobTitle = job.Title, app.AppliedAt, app.Status, app.AiMatchScore });
    }

    [HttpGet("applications")]
    public async Task<IActionResult> GetApplications(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var apps = await CandidateApplications(userId)
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => ToApplicationDto(a))
            .ToListAsync(cancellationToken);
        return Ok(apps);
    }

    [HttpGet("applications/{applicationId:int}")]
    public async Task<IActionResult> GetApplication(int applicationId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var app = await CandidateApplications(userId).Where(a => a.Id == applicationId).Select(a => ToApplicationDto(a)).FirstOrDefaultAsync(cancellationToken);
        return app == null ? NotFound(new { message = "Application not found." }) : Ok(app);
    }

    [HttpGet("applications/{applicationId:int}/status-history")]
    public async Task<IActionResult> GetStatusHistory(int applicationId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var hasAccess = await _context.Applications.AnyAsync(a => a.Id == applicationId && a.CandidateId == userId, cancellationToken);
        if (!hasAccess) return NotFound(new { message = "Application not found." });
        var history = await _context.ApplicationStatusHistories
            .AsNoTracking()
            .Where(h => h.ApplicationId == applicationId)
            .OrderByDescending(h => h.ChangedAt)
            .Select(h => new { h.Id, h.ApplicationId, h.OldStatus, h.NewStatus, ChangedByName = h.ChangedByUser.FirstName + " " + h.ChangedByUser.LastName, h.Notes, h.ChangedAt })
            .ToListAsync(cancellationToken);
        return Ok(history);
    }

    [HttpGet("applications/{applicationId:int}/messages")]
    public async Task<IActionResult> GetMessages(int applicationId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var hasAccess = await _context.Applications.AnyAsync(a => a.Id == applicationId && a.CandidateId == userId, cancellationToken);
        if (!hasAccess) return NotFound(new { message = "Application not found." });
        var messages = await _context.CommunicationMessages
            .AsNoTracking()
            .Where(m => m.ApplicationId == applicationId)
            .OrderBy(m => m.SentAt)
            .Select(m => new { m.Id, m.ApplicationId, SenderName = m.Sender.FirstName + " " + m.Sender.LastName, m.Body, m.SentAt, IsMine = m.SenderId == userId })
            .ToListAsync(cancellationToken);
        return Ok(messages);
    }

    [HttpPost("applications/{applicationId:int}/messages")]
    public async Task<IActionResult> SendMessage(int applicationId, [FromBody] CandidateMessageCreateDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var app = await _context.Applications
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.CandidateId == userId, cancellationToken);
        if (app == null) return NotFound(new { message = "Application not found." });

        var body = Clamp(request.Body, 4000);
        if (string.IsNullOrWhiteSpace(body)) return BadRequest(new { message = "Message body is required." });

        var message = new CommunicationMessage
        {
            ApplicationId = applicationId,
            SenderId = userId,
            RecipientId = app.Job.RecruiterId,
            Subject = "Candidate message",
            Body = body,
            IsRead = false,
            SentAt = DateTime.UtcNow
        };
        _context.CommunicationMessages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { message.Id, message.ApplicationId, SenderName = "You", message.Body, message.SentAt, IsMine = true });
    }

    private IQueryable<Job> ActiveJobsQuery() =>
        _context.Jobs
            .AsNoTracking()
            .AsSplitQuery()
            .Include(j => j.Department).ThenInclude(d => d.Company)
            .Include(j => j.JobSkills).ThenInclude(s => s.Skill)
            .Where(j => j.Status == "Open" || j.Status == "Published");

    private IQueryable<Application> CandidateApplications(int userId) =>
        _context.Applications
            .AsNoTracking()
            .Include(a => a.Job).ThenInclude(j => j.Department).ThenInclude(d => d.Company)
            .Where(a => a.CandidateId == userId);

    private int GetUserId()
    {
        var value = User.FindFirst("app_user_id")?.Value;
        if (int.TryParse(value, out var userId)) return userId;
        throw new UnauthorizedAccessException("User ID claim is missing or invalid.");
    }

    private static CandidateProfileDto ToProfileDto(User user)
    {
        var p = user.CandidateProfile!;
        return new CandidateProfileDto
        {
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            SummaryText = p.SummaryText,
            PortfolioUrl = p.PortfolioUrl,
            LinkedinUrl = p.LinkedinUrl,
            GithubUrl = p.GithubUrl,
            LocationCity = p.LocationCity,
            YearsOfExperience = p.YearsOfExperience,
            ResumeParseStatus = p.ResumeParseStatus,
            Skills = p.CandidateSkills.Select(s => new CandidateSkillDto { Id = s.SkillId, Name = s.Skill.Name, ProficiencyLevel = s.ProficiencyLevel, YearsOfExperience = s.YearsOfExperience, ExtractedByAi = s.ExtractedByAi }).ToList(),
            Education = p.CandidateEducations.Select(e => new CandidateEducationDto { Id = e.Id, InstitutionName = e.InstitutionName, Degree = e.Degree, FieldOfStudy = e.FieldOfStudy, StartDate = e.StartDate, EndDate = e.EndDate, IsCurrent = e.IsCurrent, Grade = e.Grade }).ToList(),
            Experience = p.CandidateWorkExperiences.Select(e => new CandidateExperienceDto { Id = e.Id, CompanyName = e.CompanyName, JobTitle = e.JobTitle, Location = e.Location, StartDate = e.StartDate, EndDate = e.EndDate, IsCurrent = e.IsCurrent, Description = e.Description }).ToList()
        };
    }

    private static CandidateJobDto ToJobDto(Job j) => new()
    {
        Id = j.Id,
        JobTitle = j.Title,
        DepartmentName = j.Department.Name,
        CompanyName = j.Department.Company.Name,
        EmploymentType = j.EmploymentType,
        WorkMode = j.WorkMode,
        Location = j.Location,
        Description = j.Description,
        Requirements = j.Requirements,
        ApplicationDeadline = j.ApplicationDeadline,
        Skills = j.JobSkills.Select(s => new CandidateJobSkillDto { Name = s.Skill.Name, IsMandatory = s.IsMandatory }).ToList()
    };

    private static CandidateApplicationDto ToApplicationDto(Application a) => new()
    {
        Id = a.Id,
        JobId = a.JobId,
        JobTitle = a.Job.Title,
        DepartmentName = a.Job.Department.Name,
        CompanyName = a.Job.Department.Company.Name,
        AppliedAt = a.AppliedAt,
        Status = a.Status,
        AiMatchScore = a.AiMatchScore
    };

    private static string? Clamp(string? value, int maxLength)
    {
        var text = value?.Trim();
        if (string.IsNullOrWhiteSpace(text)) return null;
        return text.Length <= maxLength ? text : text[..maxLength];
    }
}

public class CandidateProfileUpdateDto
{
    public string? SummaryText { get; set; }
    public string? PortfolioUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? LocationCity { get; set; }
    public int? YearsOfExperience { get; set; }
}

public class CandidateProfileDto : CandidateProfileUpdateDto
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string? ResumeParseStatus { get; set; }
    public List<CandidateSkillDto> Skills { get; set; } = new();
    public List<CandidateEducationDto> Education { get; set; } = new();
    public List<CandidateExperienceDto> Experience { get; set; } = new();
}

public class CandidateSkillDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? ProficiencyLevel { get; set; }
    public int? YearsOfExperience { get; set; }
    public bool ExtractedByAi { get; set; }
}

public class CandidateEducationDto
{
    public int Id { get; set; }
    public string InstitutionName { get; set; } = "";
    public string Degree { get; set; } = "";
    public string FieldOfStudy { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Grade { get; set; }
}

public class CandidateExperienceDto
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = "";
    public string JobTitle { get; set; } = "";
    public string? Location { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Description { get; set; }
}

public class CandidateDocumentDto
{
    public int Id { get; set; }
    public string DocumentType { get; set; } = "";
    public string FileName { get; set; } = "";
    public string FileUrl { get; set; } = "";
    public int? FileSizeKb { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime UploadedAt { get; set; }
}

public class CandidateDocumentCreateDto
{
    public string? DocumentType { get; set; }
    public string? FileName { get; set; }
    public string? FileUrl { get; set; }
    public int? FileSizeKb { get; set; }
    public bool IsPrimary { get; set; }
}

public class CandidateJobDto
{
    public int Id { get; set; }
    public string JobTitle { get; set; } = "";
    public string? DepartmentName { get; set; }
    public string? CompanyName { get; set; }
    public string? EmploymentType { get; set; }
    public string? WorkMode { get; set; }
    public string? Location { get; set; }
    public string Description { get; set; } = "";
    public string? Requirements { get; set; }
    public DateOnly? ApplicationDeadline { get; set; }
    public List<CandidateJobSkillDto> Skills { get; set; } = new();
}

public class CandidateJobSkillDto
{
    public string Name { get; set; } = "";
    public bool IsMandatory { get; set; }
}

public class CandidateApplicationDto
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string JobTitle { get; set; } = "";
    public string? DepartmentName { get; set; }
    public string? CompanyName { get; set; }
    public DateTime AppliedAt { get; set; }
    public string Status { get; set; } = "";
    public decimal? AiMatchScore { get; set; }
}

public class CandidateMessageCreateDto
{
    public string? Body { get; set; }
}
