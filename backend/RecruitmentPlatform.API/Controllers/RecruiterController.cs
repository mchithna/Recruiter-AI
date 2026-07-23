using System.Linq.Expressions;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/recruiter")]
[Authorize(Roles = "Recruiter")]
public class RecruiterController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IApplicationStatusService _applicationStatusService;
    private readonly INotificationFactory _notificationFactory;

    public RecruiterController(ApplicationDbContext context, IApplicationStatusService applicationStatusService, INotificationFactory notificationFactory)
    {
        _context = context;
        _applicationStatusService = applicationStatusService;
        _notificationFactory = notificationFactory;
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
                ApplicationCount = j.Applications.Count,
                Skills = j.JobSkills.Select(s => s.Skill.Name).ToList()
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
                ApplicationCount = j.Applications.Count,
                Skills = j.JobSkills.Select(s => s.Skill.Name).ToList()
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

        // Process Job Skills
        if (request.Skills != null && request.Skills.Count > 0)
        {
            var uniqueSkillNames = request.Skills.Select(s => s.Trim().ToLower()).Distinct().ToList();
            var existingSkills = await _context.Skills
                .Where(s => uniqueSkillNames.Contains(s.Name.ToLower()))
                .ToListAsync(cancellationToken);

            var existingSkillNames = existingSkills.Select(s => s.Name.ToLower()).ToHashSet();
            var newSkills = uniqueSkillNames
                .Where(name => !existingSkillNames.Contains(name))
                .Select(name => new Skill { Name = name })
                .ToList();

            if (newSkills.Count > 0)
            {
                _context.Skills.AddRange(newSkills);
                await _context.SaveChangesAsync(cancellationToken); // Save to generate IDs
                existingSkills.AddRange(newSkills);
            }

            foreach (var skill in existingSkills)
            {
                _context.JobSkills.Add(new JobSkill
                {
                    Job = job,
                    SkillId = skill.Id,
                    IsMandatory = true
                });
            }
        }

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
            CreatedAt = job.CreatedAt,
            Skills = job.JobSkills.Select(s => s.Skill.Name).ToList()
        });
    }

    [HttpPut("jobs/{jobId:int}/status")]
    public async Task<IActionResult> UpdateJobStatus(int jobId, [FromBody] RecruiterUpdateStatusDto request, CancellationToken cancellationToken)
    {
        if (!TryGetCompanyId(out var companyId)) return MissingRecruiterCompany();

        var job = await _context.Jobs
            .Include(j => j.Department)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.Department.CompanyId == companyId, cancellationToken);

        if (job == null) return NotFound(new { message = "Job not found." });

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            job.Status = request.Status;
            job.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }
        
        return NoContent();
    }

    [HttpPut("jobs/{jobId:int}")]
    public async Task<IActionResult> UpdateJob(int jobId, [FromBody] SaveRecruiterJobDto request, CancellationToken cancellationToken)
    {
        if (!TryGetCompanyId(out var companyId)) return MissingRecruiterCompany();

        var job = await _context.Jobs
            .Include(j => j.Department)
            .Include(j => j.JobSkills)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.Department.CompanyId == companyId, cancellationToken);

        if (job == null) return NotFound(new { message = "Job not found." });

        if (request.Title != null) job.Title = Clamp(request.Title, 255);
        if (request.Description != null) job.Description = Clamp(request.Description, 5000);
        if (request.Requirements != null) job.Requirements = Clamp(request.Requirements, 5000);
        if (request.EmploymentType != null) job.EmploymentType = Clamp(request.EmploymentType, 50);
        if (request.WorkMode != null) job.WorkMode = Clamp(request.WorkMode, 50);
        if (request.Location != null) job.Location = Clamp(request.Location, 255);
        if (request.ApplicationDeadline != null) job.ApplicationDeadline = ParseDate(request.ApplicationDeadline);
        
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            job.Status = request.Status;
        }

        job.UpdatedAt = DateTime.UtcNow;

        // Process Job Skills
        if (request.Skills != null)
        {
            _context.JobSkills.RemoveRange(job.JobSkills);
            
            if (request.Skills.Count > 0)
            {
                var uniqueSkillNames = request.Skills.Select(s => s.Trim().ToLower()).Distinct().ToList();
                var existingSkills = await _context.Skills
                    .Where(s => uniqueSkillNames.Contains(s.Name.ToLower()))
                    .ToListAsync(cancellationToken);

                var existingSkillNames = existingSkills.Select(s => s.Name.ToLower()).ToHashSet();
                var newSkills = uniqueSkillNames
                    .Where(name => !existingSkillNames.Contains(name))
                    .Select(name => new Skill { Name = name })
                    .ToList();

                if (newSkills.Count > 0)
                {
                    _context.Skills.AddRange(newSkills);
                    await _context.SaveChangesAsync(cancellationToken); // Save to generate IDs
                    existingSkills.AddRange(newSkills);
                }

                foreach (var skill in existingSkills)
                {
                    _context.JobSkills.Add(new JobSkill
                    {
                        JobId = job.Id,
                        SkillId = skill.Id,
                        IsMandatory = true
                    });
                }
            }
        }

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
        if (!TryGetCompanyId(out var companyId)) return MissingRecruiterCompany();

        var application = await RecruiterApplications(companyId)
            .Include(a => a.Job)
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

    [HttpPut("applications/{applicationId:int}/status")]
    public async Task<IActionResult> UpdateApplicationStatus(int applicationId, [FromBody] RecruiterApplicationStatusUpdateDto request, CancellationToken cancellationToken)
    {
        if (!TryGetCompanyId(out var companyId))
        {
            return MissingRecruiterCompany();
        }

        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { message = "Your recruiter profile could not be verified. Please sign out and sign in again." });
        }

        var hasAccess = await _context.Applications
            .AsNoTracking()
            .AnyAsync(a => a.Id == applicationId && a.Job.Department.CompanyId == companyId, cancellationToken);

        if (!hasAccess)
        {
            return NotFound(new { message = "Application not found." });
        }

        try
        {
            var updatedApplication = await _applicationStatusService.ChangeStatusAsync(
                applicationId,
                request.NewStatus,
                userId,
                request.Notes);

            return Ok(new
            {
                updatedApplication.Id,
                updatedApplication.Status,
                updatedApplication.UpdatedAt
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Application not found." });
        }
    }

    [HttpGet("messages/conversations")]
    public async Task<ActionResult<List<RecruiterConversationDto>>> GetConversations(CancellationToken cancellationToken)
    {
        if (!TryGetCompanyId(out var companyId)) return MissingRecruiterCompany();
        if (!TryGetUserId(out var userId)) return Unauthorized(new { message = "Your recruiter profile could not be verified. Please sign out and sign in again." });

        var applications = await _context.Applications
            .AsNoTracking()
            .Include(a => a.Candidate)
            .Include(a => a.Job)
            .Include(a => a.CommunicationMessages)
            .Where(a => a.Job.Department.CompanyId == companyId)
            .ToListAsync(cancellationToken);

        var conversations = applications
            .Select(a =>
            {
                var messages = a.CommunicationMessages.OrderByDescending(m => m.SentAt).ToList();
                var lastMsg = messages.FirstOrDefault();
                return new RecruiterConversationDto
                {
                    ApplicationId = a.Id,
                    CandidateName = a.Candidate != null ? $"{a.Candidate.FirstName} {a.Candidate.LastName}".Trim() : "Unknown Candidate",
                    JobTitle = a.Job?.Title ?? "Unknown Job",
                    Body = lastMsg != null ? lastMsg.Body : (string.IsNullOrWhiteSpace(a.CoverLetterText) ? "No messages yet" : a.CoverLetterText),
                    SentAt = lastMsg != null ? lastMsg.SentAt : a.AppliedAt,
                    Unread = messages.Any(m => !m.IsRead && m.RecipientId == userId)
                };
            })
            .OrderByDescending(c => c.SentAt)
            .ToList();

        return Ok(conversations);
    }

    [HttpGet("applications/{applicationId:int}/messages")]
    public async Task<ActionResult<List<RecruiterApplicationMessageDto>>> GetMessages(int applicationId, CancellationToken cancellationToken)
    {
        if (!TryGetCompanyId(out var companyId)) return MissingRecruiterCompany();
        if (!TryGetUserId(out var userId)) return Unauthorized(new { message = "Your recruiter profile could not be verified. Please sign out and sign in again." });

        var hasAccess = await _context.Applications
            .AsNoTracking()
            .AnyAsync(a => a.Id == applicationId
                && (a.Job.Department.CompanyId == companyId
                    || a.CommunicationMessages.Any(m => m.RecipientId == userId || m.SenderId == userId)),
                cancellationToken);

        if (!hasAccess) return NotFound(new { message = "Application not found." });

        var unreadMessages = await _context.CommunicationMessages
            .Where(m => m.ApplicationId == applicationId && m.RecipientId == userId && !m.IsRead)
            .ToListAsync(cancellationToken);

        if (unreadMessages.Count > 0)
        {
            foreach (var message in unreadMessages)
            {
                message.IsRead = true;
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        var messages = await _context.CommunicationMessages
            .AsNoTracking()
            .Where(m => m.ApplicationId == applicationId)
            .OrderBy(m => m.SentAt)
            .Select(m => new RecruiterApplicationMessageDto
            {
                Id = m.Id,
                SenderName = m.Sender != null ? (m.Sender.FirstName + " " + m.Sender.LastName).Trim() : "Unknown",
                Body = m.Body,
                SentAt = m.SentAt,
                IsMine = m.SenderId == userId
            })
            .ToListAsync(cancellationToken);

        return Ok(messages);
    }

    [HttpPost("applications/{applicationId:int}/messages")]
    public async Task<ActionResult<RecruiterApplicationMessageDto>> SendMessage(int applicationId, [FromBody] RecruiterMessageCreateDto request, CancellationToken cancellationToken)
    {
        if (!TryGetCompanyId(out var companyId)) return MissingRecruiterCompany();
        if (!TryGetUserId(out var userId)) return Unauthorized(new { message = "Your recruiter profile could not be verified. Please sign out and sign in again." });

        var application = await _context.Applications
            .AsNoTracking()
            .Include(a => a.Candidate)
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.Job.Department.CompanyId == companyId, cancellationToken);

        if (application == null) return NotFound(new { message = "Application not found." });

        var body = Clamp(request.Body, 4000);
        if (string.IsNullOrWhiteSpace(body))
        {
            return BadRequest(new { message = "Message body is required." });
        }

        var message = new CommunicationMessage
        {
            ApplicationId = application.Id,
            SenderId = userId,
            RecipientId = application.CandidateId,
            Subject = "Recruiter message",
            Body = body,
            IsRead = false,
            SentAt = DateTime.UtcNow
        };

        _context.CommunicationMessages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);

        var sender = await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new { u.FirstName, u.LastName })
            .FirstOrDefaultAsync(cancellationToken);

        try
        {
            var senderName = sender != null ? $"{sender.FirstName} {sender.LastName}".Trim() : "Recruiter";
            var snippet = body.Length > 80 ? body.Substring(0, 80) + "..." : body;

            var inApp = _notificationFactory.Create("InApp");
            await inApp.SendAsync(
                recipientId: application.CandidateId,
                type: "NewMessageReceived",
                title: $"New Message from {senderName}",
                body: $"\"{snippet}\"",
                relatedEntityType: "Application",
                relatedEntityId: application.Id
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Notification Error] Recruiter SendMessage notification failed: {ex}");
        }

        return Ok(new RecruiterApplicationMessageDto
        {
            Id = message.Id,
            SenderName = sender == null ? "Recruiter" : $"{sender.FirstName} {sender.LastName}",
            Body = message.Body,
            SentAt = message.SentAt,
            IsMine = true
        });
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
        JobStatus = a.Job.Status,
        AiMatchScore = a.AiMatchScore,
        ScreeningResult = a.AiScreeningResult == null ? null : new RecruiterAiScreeningDto
        {
            OverallScore = a.AiScreeningResult.OverallScore,
            SkillsMatchScore = a.AiScreeningResult.SkillsMatchScore,
            ExperienceMatchScore = a.AiScreeningResult.ExperienceMatchScore,
            EducationMatchScore = a.AiScreeningResult.EducationMatchScore,
            ScreeningSummary = a.AiScreeningResult.ScreeningSummary,
            AiRank = a.AiScreeningResult.AiRank,
            ProcessedAt = a.AiScreeningResult.ProcessedAt
        }
    };

    private static RecruiterApplicationDetailDto ToApplicationDetailDto(Application a)
    {
        var profile = a.Candidate?.CandidateProfile;
        return new RecruiterApplicationDetailDto
        {
            Id = a.Id,
            JobId = a.JobId,
            JobTitle = a.Job?.Title ?? "",
            JobStatus = a.Job?.Status ?? "",
            CandidateName = a.Candidate != null ? $"{a.Candidate.FirstName} {a.Candidate.LastName}".Trim() : "",
            AppliedAt = a.AppliedAt,
            Status = a.Status ?? "",
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
                FirstName = a.Candidate?.FirstName ?? "",
                LastName = a.Candidate?.LastName ?? "",
                Skills = (profile.CandidateSkills ?? Enumerable.Empty<CandidateSkill>()).Select(s => new RecruiterCandidateSkillDto
                {
                    Name = s.Skill?.Name ?? "",
                    ProficiencyLevel = s.ProficiencyLevel,
                    YearsOfExperience = s.YearsOfExperience,
                    ExtractedByAi = s.ExtractedByAi
                }).ToList(),
                Education = (profile.CandidateEducations ?? Enumerable.Empty<CandidateEducation>()).Select(e => new RecruiterCandidateEducationDto
                {
                    InstitutionName = e.InstitutionName,
                    Degree = e.Degree,
                    FieldOfStudy = e.FieldOfStudy,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsCurrent = e.IsCurrent,
                    Grade = e.Grade
                }).ToList(),
                WorkExperience = (profile.CandidateWorkExperiences ?? Enumerable.Empty<CandidateWorkExperience>()).Select(e => new RecruiterCandidateExperienceDto
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
            Interviews = (a.Interviews ?? Enumerable.Empty<Interview>()).OrderByDescending(i => i.ScheduledTime).Select(i => new RecruiterInterviewDto
            {
                Id = i.Id,
                ApplicationId = i.ApplicationId,
                CandidateName = a.Candidate != null ? $"{a.Candidate.FirstName} {a.Candidate.LastName}".Trim() : "",
                JobTitle = a.Job?.Title ?? "",
                InterviewType = i.InterviewType ?? "",
                ScheduledTime = i.ScheduledTime,
                DurationMinutes = i.DurationMinutes,
                MeetingLink = i.MeetingLink,
                Status = i.Status ?? "",
                Notes = i.Notes
            }).ToList(),
            Messages = (a.CommunicationMessages ?? Enumerable.Empty<CommunicationMessage>()).OrderBy(m => m.SentAt).Select(m => new RecruiterMessageDto
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
    public string? Status { get; set; }
    public List<string>? Skills { get; set; }
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
    public List<string> Skills { get; set; } = new();
}

public class RecruiterUpdateStatusDto
{
    public string Status { get; set; } = "";
}

public class RecruiterApplicationListDto
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string JobTitle { get; set; } = "";
    public string CandidateName { get; set; } = "";
    public DateTime AppliedAt { get; set; }
    public string Status { get; set; } = "";
    public string JobStatus { get; set; } = "";
    public decimal? AiMatchScore { get; set; }
    public RecruiterAiScreeningDto? ScreeningResult { get; set; }
}

public class RecruiterApplicationDetailDto : RecruiterApplicationListDto
{
    public string? CoverLetterText { get; set; }
    public RecruiterCandidateProfileDto? CandidateProfile { get; set; }
    public List<RecruiterInterviewDto> Interviews { get; set; } = new();
    public List<RecruiterMessageDto> Messages { get; set; } = new();
}

public class RecruiterApplicationStatusUpdateDto
{
    public string NewStatus { get; set; } = "";
    public string? Notes { get; set; }
}

public class RecruiterMessageCreateDto
{
    public string? Body { get; set; }
}

public class RecruiterApplicationMessageDto
{
    public int Id { get; set; }
    public string SenderName { get; set; } = "";
    public string Body { get; set; } = "";
    public DateTime SentAt { get; set; }
    public bool IsMine { get; set; }
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
