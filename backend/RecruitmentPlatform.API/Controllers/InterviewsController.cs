using System.Security.Claims;
using System.Linq.Expressions;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
    private readonly IConfiguration _configuration;
    private readonly ILogger<InterviewsController> _logger;

    public InterviewsController(
        ApplicationDbContext context,
        IApplicationStatusService applicationStatusService,
        IConfiguration configuration,
        ILogger<InterviewsController> logger)
    {
        _context = context;
        _applicationStatusService = applicationStatusService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<InterviewDto>>> GetInterviews(CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var interviews = await _context.Interviews
            .AsNoTracking()
            .Include(i => i.Application).ThenInclude(a => a.Candidate)
            .Include(i => i.Application).ThenInclude(a => a.Job)
            .Include(i => i.Interviewer)
            .Where(i => i.Application.Job.Department.CompanyId == companyId)
            .OrderBy(i => i.ScheduledTime)
            .Select(ToInterviewDtoExpr)
            .ToListAsync(cancellationToken);

        return Ok(interviews);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<InterviewDto>> GetInterviewById(int id, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();

        var interview = await _context.Interviews
            .AsNoTracking()
            .Include(i => i.Application).ThenInclude(a => a.Candidate)
            .Include(i => i.Application).ThenInclude(a => a.Job)
            .Include(i => i.Interviewer)
            .FirstOrDefaultAsync(i => i.Id == id && i.Application.Job.Department.CompanyId == companyId, cancellationToken);

        if (interview == null)
        {
            return NotFound(new { message = "Interview not found." });
        }

        return Ok(ToInterviewDto(interview));
    }

    [HttpGet("application/{applicationId:int}")]
    public async Task<ActionResult<List<InterviewDto>>> GetInterviewsForApplication(int applicationId, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var interviews = await _context.Interviews
            .AsNoTracking()
            .Include(i => i.Application).ThenInclude(a => a.Candidate)
            .Include(i => i.Application).ThenInclude(a => a.Job)
            .Include(i => i.Interviewer)
            .Where(i => i.ApplicationId == applicationId && i.Application.Job.Department.CompanyId == companyId)
            .OrderBy(i => i.ScheduledTime)
            .Select(ToInterviewDtoExpr)
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

            var meetingLink = string.IsNullOrWhiteSpace(request.MeetingLink)
                ? await GenerateGoogleMeetLinkAsync(request.ScheduledTime, request.DurationMinutes, application.CandidateName, application.JobTitle, cancellationToken)
                : ClampOptional(request.MeetingLink, 500);

            var interview = new Interview
            {
                ApplicationId = application.Id,
                InterviewerId = interviewer.Id,
                InterviewType = Clamp(request.InterviewType, 50, "Interview type is required."),
                ScheduledTime = request.ScheduledTime,
                DurationMinutes = request.DurationMinutes <= 0 ? 60 : request.DurationMinutes,
                MeetingLink = meetingLink,
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

        var interview = await _context.Interviews
            .Include(i => i.Application)
            .ThenInclude(a => a.Job)
            .ThenInclude(j => j.Department)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (interview == null || interview.Application.Job.Department.CompanyId != companyId)
        {
            return NotFound(new { message = "Interview not found." });
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

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Recruiter")]
    public async Task<IActionResult> UpdateInterview(int id, [FromBody] UpdateInterviewRequest request, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();

        var interview = await _context.Interviews
            .Include(i => i.Application)
            .ThenInclude(a => a.Candidate)
            .Include(i => i.Application)
            .ThenInclude(a => a.Job)
            .ThenInclude(j => j.Department)
            .FirstOrDefaultAsync(i => i.Id == id && i.Application.Job.Department.CompanyId == companyId, cancellationToken);

        if (interview == null)
        {
            return NotFound(new { message = "Interview not found." });
        }

        if (request.InterviewerId > 0)
        {
            var interviewer = await _context.Users
                .Include(u => u.Role)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == request.InterviewerId && u.CompanyId == companyId && u.IsActive, cancellationToken);

            if (interviewer == null || !string.Equals(interviewer.Role?.Name, "HiringManager", StringComparison.Ordinal))
            {
                return BadRequest(new { message = "Interviewer must be an active Hiring Manager in your company." });
            }

            interview.InterviewerId = request.InterviewerId;
        }

        if (!string.IsNullOrWhiteSpace(request.InterviewType))
        {
            interview.InterviewType = Clamp(request.InterviewType, 50, "Interview type is required.");
        }

        if (request.ScheduledTime != default)
        {
            interview.ScheduledTime = request.ScheduledTime;
        }

        if (request.DurationMinutes > 0)
        {
            interview.DurationMinutes = request.DurationMinutes;
        }

        if (request.MeetingLink != null)
        {
            interview.MeetingLink = string.IsNullOrWhiteSpace(request.MeetingLink)
                ? await GenerateGoogleMeetLinkAsync(
                    request.ScheduledTime == default ? interview.ScheduledTime : request.ScheduledTime,
                    request.DurationMinutes > 0 ? request.DurationMinutes : interview.DurationMinutes,
                    $"{interview.Application.Candidate.FirstName} {interview.Application.Candidate.LastName}".Trim(),
                    interview.Application.Job.Title,
                    cancellationToken)
                : ClampOptional(request.MeetingLink, 500);
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            interview.Status = request.Status;
        }

        if (request.Notes != null)
        {
            interview.Notes = ClampOptional(request.Notes, 4000);
        }

        interview.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Interview updated successfully." });
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

    private static Expression<Func<Interview, InterviewDto>> ToInterviewDtoExpr => interview => new InterviewDto
    {
        Id = interview.Id,
        ApplicationId = interview.ApplicationId,
        CandidateName = interview.Application != null && interview.Application.Candidate != null
            ? (interview.Application.Candidate.FirstName + " " + interview.Application.Candidate.LastName).Trim()
            : "Unknown Candidate",
        JobTitle = interview.Application != null && interview.Application.Job != null ? interview.Application.Job.Title : "Unknown Job",
        InterviewType = interview.InterviewType ?? "",
        ScheduledTime = interview.ScheduledTime,
        DurationMinutes = interview.DurationMinutes,
        MeetingLink = interview.MeetingLink,
        Status = interview.Status ?? "",
        Notes = interview.Notes,
        InterviewerId = interview.InterviewerId,
        InterviewerName = interview.Interviewer != null
            ? (interview.Interviewer.FirstName + " " + interview.Interviewer.LastName).Trim()
            : "Unknown Interviewer"
    };

    private static InterviewDto ToInterviewDto(Interview interview) => new InterviewDto
    {
        Id = interview.Id,
        ApplicationId = interview.ApplicationId,
        CandidateName = interview.Application?.Candidate != null
            ? $"{interview.Application.Candidate.FirstName} {interview.Application.Candidate.LastName}".Trim()
            : "Unknown Candidate",
        JobTitle = interview.Application?.Job?.Title ?? "Unknown Job",
        InterviewType = interview.InterviewType ?? "",
        ScheduledTime = interview.ScheduledTime,
        DurationMinutes = interview.DurationMinutes,
        MeetingLink = interview.MeetingLink,
        Status = interview.Status ?? "",
        Notes = interview.Notes,
        InterviewerId = interview.InterviewerId,
        InterviewerName = interview.Interviewer != null
            ? $"{interview.Interviewer.FirstName} {interview.Interviewer.LastName}".Trim()
            : "Unknown Interviewer"
    };

    private static readonly HttpClient MeetHttpClient = new();

    private async Task<string> GenerateGoogleMeetLinkAsync(
        DateTime scheduledTime,
        int durationMinutes,
        string candidateName,
        string jobTitle,
        CancellationToken cancellationToken)
    {
        var accessToken = await ResolveGoogleAccessTokenAsync(cancellationToken);
        if (!string.IsNullOrWhiteSpace(accessToken))
        {
            var meetLink = await TryCreateMeetSpaceAsync(accessToken, cancellationToken);
            if (!string.IsNullOrWhiteSpace(meetLink))
            {
                return meetLink;
            }

            var calendarLink = await TryCreateCalendarMeetEventAsync(accessToken, scheduledTime, durationMinutes, candidateName, jobTitle, cancellationToken);
            if (!string.IsNullOrWhiteSpace(calendarLink))
            {
                return calendarLink;
            }
        }

        return GenerateFallbackMeetUrl();
    }

    private async Task<string?> ResolveGoogleAccessTokenAsync(CancellationToken cancellationToken)
    {
        var rawToken = GetGoogleWorkspaceAccessToken();
        if (string.IsNullOrWhiteSpace(rawToken)) return null;

        if (rawToken.StartsWith("ya29.", StringComparison.OrdinalIgnoreCase))
        {
            return rawToken;
        }

        if (rawToken.StartsWith("4/", StringComparison.Ordinal))
        {
            try
            {
                var dict = new Dictionary<string, string>
                {
                    ["client_id"] = "206478989404-5q9q4k0m016e3v3m106m.apps.googleusercontent.com",
                    ["code"] = rawToken,
                    ["grant_type"] = "authorization_code",
                    ["redirect_uri"] = "https://developers.google.com/oauthplayground"
                };

                using var req = new HttpRequestMessage(HttpMethod.Post, "https://oauth2.googleapis.com/token")
                {
                    Content = new FormUrlEncodedContent(dict)
                };

                var res = await MeetHttpClient.SendAsync(req, cancellationToken);
                if (res.IsSuccessStatusCode)
                {
                    var json = await res.Content.ReadAsStringAsync(cancellationToken);
                    using var doc = System.Text.Json.JsonDocument.Parse(json);
                    if (doc.RootElement.TryGetProperty("access_token", out var tokenProp) && !string.IsNullOrWhiteSpace(tokenProp.GetString()))
                    {
                        return tokenProp.GetString();
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to exchange auth code starting with 4/");
            }
        }

        return rawToken;
    }

    private static string GenerateFallbackMeetUrl()
    {
        // https://meet.google.com/new opens a real, instant Google Meet room
        return "https://meet.google.com/new";
    }

    private async Task<string?> TryCreateMeetSpaceAsync(string accessToken, CancellationToken cancellationToken)
    {
        try
        {
            using var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://meet.googleapis.com/v2/spaces")
            {
                Content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json")
            };
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await MeetHttpClient.SendAsync(requestMessage, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Google Meet space creation failed with status {StatusCode}.", (int)response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = System.Text.Json.JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("meetingUri", out var uriProp) && !string.IsNullOrWhiteSpace(uriProp.GetString()))
            {
                return uriProp.GetString();
            }
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or System.Text.Json.JsonException)
        {
            _logger.LogWarning(ex, "Google Meet space creation failed.");
        }

        return null;
    }

    private async Task<string?> TryCreateCalendarMeetEventAsync(
        string accessToken,
        DateTime scheduledTime,
        int durationMinutes,
        string candidateName,
        string jobTitle,
        CancellationToken cancellationToken)
    {
        try
        {
            var start = scheduledTime == default ? DateTime.UtcNow.AddHours(1) : scheduledTime.ToUniversalTime();
            var safeDurationMinutes = durationMinutes <= 0 ? 60 : durationMinutes;
            var payload = new
            {
                summary = $"Interview: {candidateName} - {jobTitle}",
                description = "Recruiter AI interview session.",
                start = new { dateTime = start.ToString("yyyy-MM-ddTHH:mm:ssZ") },
                end = new { dateTime = start.AddMinutes(safeDurationMinutes).ToString("yyyy-MM-ddTHH:mm:ssZ") },
                conferenceData = new
                {
                    createRequest = new
                    {
                        requestId = Guid.NewGuid().ToString("N"),
                        conferenceSolutionKey = new { type = "hangoutsMeet" }
                    }
                }
            };

            using var calendarRequest = new HttpRequestMessage(HttpMethod.Post, "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1")
            {
                Content = new StringContent(System.Text.Json.JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json")
            };
            calendarRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await MeetHttpClient.SendAsync(calendarRequest, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Google Calendar event creation failed with status {StatusCode}.", (int)response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = System.Text.Json.JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("hangoutLink", out var linkProp) && !string.IsNullOrWhiteSpace(linkProp.GetString()))
            {
                return linkProp.GetString();
            }

            if (doc.RootElement.TryGetProperty("conferenceData", out var conferenceData)
                && conferenceData.TryGetProperty("entryPoints", out var entryPoints)
                && entryPoints.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                foreach (var entryPoint in entryPoints.EnumerateArray())
                {
                    if (entryPoint.TryGetProperty("entryPointType", out var typeProp)
                        && string.Equals(typeProp.GetString(), "video", StringComparison.OrdinalIgnoreCase)
                        && entryPoint.TryGetProperty("uri", out var uriProp)
                        && !string.IsNullOrWhiteSpace(uriProp.GetString()))
                    {
                        return uriProp.GetString();
                    }
                }
            }
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or System.Text.Json.JsonException)
        {
            _logger.LogWarning(ex, "Google Calendar event creation failed.");
        }

        return null;
    }

    private string? GetGoogleWorkspaceAccessToken()
    {
        return FirstConfiguredValue(
            "GOOGLE_WORKSPACE_ACCESS_TOKEN",
            "GOOGLE_MEET_ACCESS_TOKEN",
            "GOOGLE_CALENDAR_ACCESS_TOKEN",
            "GOOGLE_ACCESS_TOKEN");
    }

    private string? FirstConfiguredValue(params string[] keys)
    {
        foreach (var key in keys)
        {
            var value = _configuration[key] ?? Environment.GetEnvironmentVariable(key);
            if (!string.IsNullOrWhiteSpace(value)) return value.Trim();
        }

        return null;
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

public class UpdateInterviewRequest
{
    public int InterviewerId { get; set; }
    public string? InterviewType { get; set; }
    public DateTime ScheduledTime { get; set; }
    public int DurationMinutes { get; set; }
    public string? MeetingLink { get; set; }
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
