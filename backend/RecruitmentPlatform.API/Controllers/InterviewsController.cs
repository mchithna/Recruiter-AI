using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/interviews")]
[Authorize(Roles = "Recruiter,HiringManager")]
public class InterviewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IApplicationStatusService _applicationStatusService;

    public InterviewsController(ApplicationDbContext context, IApplicationStatusService applicationStatusService)
    {
        _context = context;
        _applicationStatusService = applicationStatusService;
    }

    [HttpGet]
    public async Task<ActionResult<List<InterviewDto>>> GetInterviews(CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();
        var isRecruiter = User.IsInRole("Recruiter");

        var query = _context.Interviews
            .AsNoTracking()
            .Where(i => i.Application.Job.Department.CompanyId == companyId);

        if (!isRecruiter)
        {
            query = query.Where(i => i.InterviewerId == userId);
        }

        var interviews = await query
            .OrderBy(i => i.ScheduledTime)
            .Select(i => ToInterviewDto(i))
            .ToListAsync(cancellationToken);

        return Ok(interviews);
    }

    [HttpGet("application/{applicationId:int}")]
    public async Task<ActionResult<List<InterviewDto>>> GetInterviewsForApplication(int applicationId, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();
        var isRecruiter = User.IsInRole("Recruiter");

        var query = _context.Interviews
            .AsNoTracking()
            .Where(i => i.ApplicationId == applicationId && i.Application.Job.Department.CompanyId == companyId);

        if (!isRecruiter)
        {
            query = query.Where(i => i.InterviewerId == userId);
        }

        var interviews = await query
            .OrderBy(i => i.ScheduledTime)
            .Select(i => ToInterviewDto(i))
            .ToListAsync(cancellationToken);

        return Ok(interviews);
    }

    [HttpPost]
    [Authorize(Roles = "Recruiter")]
    public async Task<ActionResult<InterviewDto>> CreateInterview([FromBody] CreateInterviewRequest request, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var recruiterId = GetUserId();

        var application = await _context.Applications
            .AsNoTracking()
            .Where(a => a.Id == request.ApplicationId && a.Job.Department.CompanyId == companyId)
            .Select(a => new
            {
                a.Id,
                a.JobId,
                JobTitle = a.Job.Title,
                CandidateName = a.Candidate.FirstName + " " + a.Candidate.LastName
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (application == null)
        {
            return NotFound(new { message = "Application not found." });
        }

        var interviewer = await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == request.InterviewerId && u.CompanyId == companyId && u.IsActive)
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                RoleName = u.Role.Name
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (interviewer == null || !string.Equals(interviewer.RoleName, "HiringManager", StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Interviewer must be an active Hiring Manager in your company." });
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await _applicationStatusService.ChangeStatusAsync(application.Id, "Interview Scheduled", recruiterId, request.Notes);

            var interview = new Interview
            {
                ApplicationId = application.Id,
                InterviewerId = interviewer.Id,
                InterviewType = Clamp(request.InterviewType, 50, "Interview type is required."),
                ScheduledTime = request.ScheduledTime,
                DurationMinutes = request.DurationMinutes <= 0 ? 60 : request.DurationMinutes,
                MeetingLink = ClampOptional(request.MeetingLink, 500),
                Status = "Scheduled",
                Notes = ClampOptional(request.Notes, 4000),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Interviews.Add(interview);
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Ok(new InterviewDto
            {
                Id = interview.Id,
                ApplicationId = interview.ApplicationId,
                CandidateName = application.CandidateName,
                JobTitle = application.JobTitle,
                InterviewType = interview.InterviewType,
                ScheduledTime = interview.ScheduledTime,
                DurationMinutes = interview.DurationMinutes,
                MeetingLink = interview.MeetingLink,
                Status = interview.Status,
                Notes = interview.Notes,
                InterviewerId = interviewer.Id,
                InterviewerName = $"{interviewer.FirstName} {interviewer.LastName}"
            });
        }
        catch (InvalidOperationException ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            await transaction.RollbackAsync(cancellationToken);
            return NotFound(new { message = "Application not found." });
        }
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateInterviewStatus(int id, [FromBody] UpdateInterviewStatusRequest request, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();
        var isRecruiter = User.IsInRole("Recruiter");

        var interview = await _context.Interviews
            .Include(i => i.Application)
            .ThenInclude(a => a.Job)
            .ThenInclude(j => j.Department)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (interview == null || interview.Application.Job.Department.CompanyId != companyId)
        {
            return NotFound(new { message = "Interview not found." });
        }

        if (!isRecruiter && interview.InterviewerId != userId)
        {
            return Forbid();
        }

        var status = Clamp(request.Status, 50, "Status is required.");
        interview.Status = status;
        interview.Notes = ClampOptional(request.Notes, 4000);
        interview.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new
        {
            interview.Id,
            interview.Status,
            interview.UpdatedAt
        });
    }

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

    private static InterviewDto ToInterviewDto(Interview interview)
    {
        return new InterviewDto
        {
            Id = interview.Id,
            ApplicationId = interview.ApplicationId,
            CandidateName = interview.Application.Candidate.FirstName + " " + interview.Application.Candidate.LastName,
            JobTitle = interview.Application.Job.Title,
            InterviewType = interview.InterviewType,
            ScheduledTime = interview.ScheduledTime,
            DurationMinutes = interview.DurationMinutes,
            MeetingLink = interview.MeetingLink,
            Status = interview.Status,
            Notes = interview.Notes,
            InterviewerId = interview.InterviewerId,
            InterviewerName = interview.Interviewer.FirstName + " " + interview.Interviewer.LastName
        };
    }

    private static string Clamp(string? value, int maxLength, string requiredMessage)
    {
        var text = value?.Trim() ?? string.Empty;
        if (text.Length == 0)
        {
            throw new InvalidOperationException(requiredMessage);
        }

        return text.Length <= maxLength ? text : text[..maxLength];
    }

    private static string? ClampOptional(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var text = value.Trim();
        return text.Length <= maxLength ? text : text[..maxLength];
    }
}

public class CreateInterviewRequest
{
    public int ApplicationId { get; set; }
    public int InterviewerId { get; set; }
    public string? InterviewType { get; set; }
    public DateTime ScheduledTime { get; set; }
    public int DurationMinutes { get; set; }
    public string? MeetingLink { get; set; }
    public string? Notes { get; set; }
}

public class UpdateInterviewStatusRequest
{
    public string? Status { get; set; }
    public string? Notes { get; set; }
}

public class InterviewDto
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public string CandidateName { get; set; } = "";
    public string JobTitle { get; set; } = "";
    public int InterviewerId { get; set; }
    public string InterviewerName { get; set; } = "";
    public string InterviewType { get; set; } = "";
    public DateTime ScheduledTime { get; set; }
    public int DurationMinutes { get; set; }
    public string? MeetingLink { get; set; }
    public string Status { get; set; } = "";
    public string? Notes { get; set; }
}