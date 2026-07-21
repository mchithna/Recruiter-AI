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
    private readonly IServiceScopeFactory _scopeFactory;

    public CandidateController(ApplicationDbContext context, IServiceScopeFactory scopeFactory)
    {
        _context = context;
        _scopeFactory = scopeFactory;
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


    [HttpPost("profile/skills")]
    public async Task<IActionResult> AddProfileSkill([FromBody] CandidateSkillCreateDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var hasProfile = await _context.CandidateProfiles.AnyAsync(p => p.UserId == userId, cancellationToken);
        if (!hasProfile) return NotFound(new { message = "Candidate profile not found." });

        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest(new { message = "Skill name is required." });
        
        var nameLower = request.Name.Trim().ToLower();
        var skill = await _context.Skills.FirstOrDefaultAsync(s => s.Name.ToLower() == nameLower, cancellationToken);
        if (skill == null)
        {
            skill = new Skill { Name = request.Name.Trim() };
            _context.Skills.Add(skill);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var exists = await _context.CandidateSkills.AnyAsync(cs => cs.CandidateId == userId && cs.SkillId == skill.Id, cancellationToken);
        if (exists) return Conflict(new { message = "Skill already added." });

        var candidateSkill = new CandidateSkill
        {
            CandidateId = userId,
            SkillId = skill.Id,
            ProficiencyLevel = Clamp(request.ProficiencyLevel, 50) ?? "Intermediate",
            YearsOfExperience = request.YearsOfExperience,
            ExtractedByAi = false
        };

        _context.CandidateSkills.Add(candidateSkill);
        await _context.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    [HttpDelete("profile/skills/{skillId:int}")]
    public async Task<IActionResult> DeleteProfileSkill(int skillId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var candidateSkill = await _context.CandidateSkills.FirstOrDefaultAsync(cs => cs.CandidateId == userId && cs.SkillId == skillId, cancellationToken);
        if (candidateSkill == null) return NotFound(new { message = "Skill not found on profile." });
        
        _context.CandidateSkills.Remove(candidateSkill);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("profile/experience")]
    public async Task<IActionResult> AddProfileExperience([FromBody] CandidateExperienceCreateDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var hasProfile = await _context.CandidateProfiles.AnyAsync(p => p.UserId == userId, cancellationToken);
        if (!hasProfile) return NotFound(new { message = "Candidate profile not found." });

        if (string.IsNullOrWhiteSpace(request.CompanyName) || string.IsNullOrWhiteSpace(request.JobTitle))
            return BadRequest(new { message = "Company name and job title are required." });

        var exp = new CandidateWorkExperience
        {
            CandidateId = userId,
            CompanyName = Clamp(request.CompanyName, 255)!,
            JobTitle = Clamp(request.JobTitle, 255)!,
            Location = Clamp(request.Location, 255),
            StartDate = ParseDate(request.StartDate) ?? default,
            EndDate = ParseDate(request.EndDate),
            IsCurrent = request.IsCurrent,
            Description = Clamp(request.Description, 2000)
        };
        _context.CandidateWorkExperiences.Add(exp);
        await _context.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    [HttpPut("profile/experience/{id:int}")]
    public async Task<IActionResult> UpdateProfileExperience(int id, [FromBody] CandidateExperienceCreateDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var exp = await _context.CandidateWorkExperiences.FirstOrDefaultAsync(e => e.Id == id && e.CandidateId == userId, cancellationToken);
        if (exp == null) return NotFound(new { message = "Experience not found." });

        if (string.IsNullOrWhiteSpace(request.CompanyName) || string.IsNullOrWhiteSpace(request.JobTitle))
            return BadRequest(new { message = "Company name and job title are required." });

        exp.CompanyName = Clamp(request.CompanyName, 255)!;
        exp.JobTitle = Clamp(request.JobTitle, 255)!;
        exp.Location = Clamp(request.Location, 255);
        exp.StartDate = ParseDate(request.StartDate) ?? exp.StartDate;
        exp.EndDate = ParseDate(request.EndDate);
        exp.IsCurrent = request.IsCurrent;
        exp.Description = Clamp(request.Description, 2000);
        
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("profile/experience/{id:int}")]
    public async Task<IActionResult> DeleteProfileExperience(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var exp = await _context.CandidateWorkExperiences.FirstOrDefaultAsync(e => e.Id == id && e.CandidateId == userId, cancellationToken);
        if (exp == null) return NotFound(new { message = "Experience not found." });
        
        _context.CandidateWorkExperiences.Remove(exp);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("profile/education")]
    public async Task<IActionResult> AddProfileEducation([FromBody] CandidateEducationCreateDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var hasProfile = await _context.CandidateProfiles.AnyAsync(p => p.UserId == userId, cancellationToken);
        if (!hasProfile) return NotFound(new { message = "Candidate profile not found." });

        if (string.IsNullOrWhiteSpace(request.InstitutionName) || string.IsNullOrWhiteSpace(request.Degree))
            return BadRequest(new { message = "Institution name and degree are required." });

        var edu = new CandidateEducation
        {
            CandidateId = userId,
            InstitutionName = Clamp(request.InstitutionName, 255)!,
            Degree = Clamp(request.Degree, 255)!,
            FieldOfStudy = Clamp(request.FieldOfStudy, 255) ?? "",
            StartDate = ParseDate(request.StartDate) ?? default,
            EndDate = ParseDate(request.EndDate),
            IsCurrent = request.IsCurrent,
            Grade = Clamp(request.Grade, 50)
        };
        _context.CandidateEducations.Add(edu);
        await _context.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    [HttpPut("profile/education/{id:int}")]
    public async Task<IActionResult> UpdateProfileEducation(int id, [FromBody] CandidateEducationCreateDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var edu = await _context.CandidateEducations.FirstOrDefaultAsync(e => e.Id == id && e.CandidateId == userId, cancellationToken);
        if (edu == null) return NotFound(new { message = "Education not found." });

        if (string.IsNullOrWhiteSpace(request.InstitutionName) || string.IsNullOrWhiteSpace(request.Degree))
            return BadRequest(new { message = "Institution name and degree are required." });

        edu.InstitutionName = Clamp(request.InstitutionName, 255)!;
        edu.Degree = Clamp(request.Degree, 255)!;
        edu.FieldOfStudy = Clamp(request.FieldOfStudy, 255) ?? "";
        edu.StartDate = ParseDate(request.StartDate) ?? edu.StartDate;
        edu.EndDate = ParseDate(request.EndDate);
        edu.IsCurrent = request.IsCurrent;
        edu.Grade = Clamp(request.Grade, 50);
        
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("profile/education/{id:int}")]
    public async Task<IActionResult> DeleteProfileEducation(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var edu = await _context.CandidateEducations.FirstOrDefaultAsync(e => e.Id == id && e.CandidateId == userId, cancellationToken);
        if (edu == null) return NotFound(new { message = "Education not found." });
        
        _context.CandidateEducations.Remove(edu);
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

        var history = new ApplicationStatusHistory
        {
            Application = app,
            ChangedBy = userId,
            OldStatus = null,
            NewStatus = "Applied",
            ChangedAt = DateTime.UtcNow
        };
        _context.ApplicationStatusHistories.Add(history);

        await _context.SaveChangesAsync(cancellationToken);

        var appId = app.Id;
        _ = Task.Run(async () => await ProcessAiMatchingAsync(appId));

        return Ok(new { app.Id, app.JobId, JobTitle = job.Title, app.AppliedAt, app.Status, app.AiMatchScore });
    }

    private async Task ProcessAiMatchingAsync(int applicationId)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var gemini = scope.ServiceProvider.GetRequiredService<RecruitmentPlatform.Core.Interfaces.IGeminiStructuredService>();

            var app = await db.Applications
                .Include(a => a.Job).ThenInclude(j => j.JobSkills).ThenInclude(s => s.Skill)
                .Include(a => a.Candidate).ThenInclude(c => c.CandidateProfile)!.ThenInclude(p => p.CandidateEducations)
                .Include(a => a.Candidate).ThenInclude(c => c.CandidateProfile)!.ThenInclude(p => p.CandidateWorkExperiences)
                .Include(a => a.Candidate).ThenInclude(c => c.CandidateProfile)!.ThenInclude(p => p.CandidateSkills).ThenInclude(s => s.Skill)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (app == null || string.IsNullOrWhiteSpace(app.Job.Description)) return;

            var jobSnapshot = new
            {
                app.Job.Id,
                app.Job.Title,
                description = Clamp(app.Job.Description, 3000),
                requirements = Clamp(app.Job.Requirements, 3000),
                app.Job.EmploymentType,
                app.Job.WorkMode,
                app.Job.Location,
                mandatorySkills = app.Job.JobSkills.Where(s => s.IsMandatory).Select(s => s.Skill.Name),
                preferredSkills = app.Job.JobSkills.Where(s => !s.IsMandatory).Select(s => s.Skill.Name)
            };

            var profile = app.Candidate.CandidateProfile;
            var candidateSnapshot = new
            {
                applicationId = app.Id,
                candidateName = app.Candidate.FirstName + " " + app.Candidate.LastName,
                profileSummary = Clamp(profile?.SummaryText, 2500),
                profile?.YearsOfExperience,
                skills = profile?.CandidateSkills.Select(s => new { s.Skill.Name, s.ProficiencyLevel, s.YearsOfExperience }),
                education = profile?.CandidateEducations.Select(e => new { e.InstitutionName, e.Degree, e.FieldOfStudy, e.IsCurrent }),
                experience = profile?.CandidateWorkExperiences.Select(e => new { e.CompanyName, e.JobTitle, e.IsCurrent, description = Clamp(e.Description, 1200) })
            };

            var prompt = System.Text.Json.JsonSerializer.Serialize(new
            {
                task = "Compare the candidate against this vacancy. Scores must be 0-100 integers.",
                authorizedData = new { applicationId = app.Id, job = jobSnapshot, candidate = candidateSnapshot }
            });

            var result = await gemini.GenerateJsonAsync<RecruitmentPlatform.Core.DTOs.CandidateJobMatchResultDto>(
                "You are Hirely AI. Return valid JSON only. Scores must be 0-100 integers.",
                prompt);

            if (result != null)
            {
                result.OverallMatchScore = Math.Clamp(result.OverallMatchScore, 0, 100);
                result.SkillMatchScore = Math.Clamp(result.SkillMatchScore, 0, 100);
                result.ExperienceMatchScore = Math.Clamp(result.ExperienceMatchScore, 0, 100);
                result.EducationMatchScore = Math.Clamp(result.EducationMatchScore, 0, 100);

                var screening = new AiScreeningResult
                {
                    ApplicationId = app.Id,
                    OverallScore = result.OverallMatchScore,
                    SkillsMatchScore = result.SkillMatchScore,
                    ExperienceMatchScore = result.ExperienceMatchScore,
                    EducationMatchScore = result.EducationMatchScore,
                    ScreeningSummary = result.Explanation,
                    ProcessedAt = DateTime.UtcNow
                };

                db.AiScreeningResults.Add(screening);
                app.AiMatchScore = result.OverallMatchScore;
                app.UpdatedAt = DateTime.UtcNow;

                await db.SaveChangesAsync();
            }
        }
        catch
        {
            // Background task failure ignored
        }
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
            .Include(a => a.Job).ThenInclude(j => j.Department)
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.CandidateId == userId, cancellationToken);
        if (app == null) return NotFound(new { message = "Application not found." });

        var body = Clamp(request.Body, 4000);
        if (string.IsNullOrWhiteSpace(body)) return BadRequest(new { message = "Message body is required." });

        var recruiterId = await ResolveRecruiterRecipientIdAsync(app.Job, cancellationToken);
        if (recruiterId == null)
        {
            return BadRequest(new { message = "No active recruiter is available for this job. Please try again later." });
        }

        var message = new CommunicationMessage
        {
            ApplicationId = applicationId,
            SenderId = userId,
            RecipientId = recruiterId.Value,
            Subject = "Candidate message",
            Body = body,
            IsRead = false,
            SentAt = DateTime.UtcNow
        };
        _context.CommunicationMessages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { message.Id, message.ApplicationId, SenderName = "You", message.Body, message.SentAt, IsMine = true });
    }

    private async Task<int?> ResolveRecruiterRecipientIdAsync(Job job, CancellationToken cancellationToken)
    {
        var companyId = job.Department.CompanyId;

        var jobRecruiter = await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == job.RecruiterId
                && u.IsActive
                && u.CompanyId == companyId
                && u.Role.Name == "Recruiter")
            .Select(u => (int?)u.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (jobRecruiter != null) return jobRecruiter;

        return await _context.Users
            .AsNoTracking()
            .Where(u => u.IsActive
                && u.CompanyId == companyId
                && u.Role.Name == "Recruiter")
            .OrderByDescending(u => u.DepartmentId == job.DepartmentId)
            .ThenBy(u => u.Id)
            .Select(u => (int?)u.Id)
            .FirstOrDefaultAsync(cancellationToken);
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
    private DateOnly? ParseDate(string? dateStr)
    {
        if (string.IsNullOrWhiteSpace(dateStr)) return null;
        if (dateStr.Length == 7 && dateStr[4] == '-') dateStr += "-01";
        if (DateOnly.TryParse(dateStr, out var d)) return d;
        return null;
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

public class CandidateSkillCreateDto
{
    public string Name { get; set; } = "";
    public string? ProficiencyLevel { get; set; }
    public int? YearsOfExperience { get; set; }
}

public class CandidateExperienceCreateDto
{
    public string CompanyName { get; set; } = "";
    public string JobTitle { get; set; } = "";
    public string? Location { get; set; }
    public string StartDate { get; set; } = "";
    public string? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Description { get; set; }
}

public class CandidateEducationCreateDto
{
    public string InstitutionName { get; set; } = "";
    public string Degree { get; set; } = "";
    public string FieldOfStudy { get; set; } = "";
    public string StartDate { get; set; } = "";
    public string? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Grade { get; set; }
}
