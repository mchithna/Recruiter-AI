using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/hiring-manager")]
[Authorize(Roles = "HiringManager")]
public class HiringManagerController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IApplicationStatusService _applicationStatusService;

    public HiringManagerController(ApplicationDbContext context, IApplicationStatusService applicationStatusService)
    {
        _context = context;
        _applicationStatusService = applicationStatusService;
    }

    [HttpGet("jobs")]
    public async Task<ActionResult<List<HiringManagerJobDto>>> GetJobs(CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var jobs = await _context.Jobs
            .AsNoTracking()
            .Where(j => j.Department.CompanyId == companyId)
            .Where(j => j.HiringManagerId == userId || j.Applications.Any(a => a.Interviews.Any(i => i.InterviewerId == userId)))
            .Select(j => new HiringManagerJobDto
            {
                Id = j.Id,
                Title = j.Title,
                DepartmentName = j.Department.Name,
                ShortlistedCount = j.Applications.Count(a => a.Status == "Shortlisted"),
                InterviewingCount = j.Applications.Count(a => a.Status == "Interview Scheduled")
            })
            .ToListAsync(cancellationToken);

        return Ok(jobs);
    }

    [HttpGet("jobs/{jobId:int}/applications")]
    public async Task<ActionResult<List<HiringManagerApplicationListDto>>> GetJobApplications(int jobId, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var visibleStatuses = new[]
        {
            "Shortlisted",
            "Interview Scheduled",
            "Offer Extended",
            "Hired",
            "Rejected"
        };

        var applications = await _context.Applications
            .AsNoTracking()
            .Where(a => a.JobId == jobId && a.Job.Department.CompanyId == companyId)
            .Where(a => a.Job.HiringManagerId == userId || a.Interviews.Any(i => i.InterviewerId == userId))
            .Where(a => visibleStatuses.Contains(a.Status) || a.Interviews.Any(i => i.InterviewerId == userId))
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => new HiringManagerApplicationListDto
            {
                Id = a.Id,
                JobId = a.JobId,
                JobTitle = a.Job.Title,
                CandidateName = a.Candidate.FirstName + " " + a.Candidate.LastName,
                AppliedAt = a.AppliedAt,
                Status = a.Status,
                AiMatchScore = a.AiMatchScore,
                ScheduledTime = a.Interviews
                    .Where(i => i.InterviewerId == userId && (i.Status == "Scheduled" || i.Status == "Confirmed" || i.Status == "Rescheduled"))
                    .OrderBy(i => i.ScheduledTime)
                    .Select(i => (DateTime?)i.ScheduledTime)
                    .FirstOrDefault()
                    ?? a.Interviews
                        .OrderBy(i => i.ScheduledTime)
                        .Select(i => (DateTime?)i.ScheduledTime)
                        .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return Ok(applications);
    }

    [HttpGet("applications/{id:int}")]
    public async Task<ActionResult<HiringManagerApplicationDetailDto>> GetApplication(int id, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var application = await _context.Applications
            .AsNoTracking()
            .Include(a => a.Job)
            .Include(a => a.AiScreeningResult)
            .Include(a => a.Document)
            .Include(a => a.Candidate).ThenInclude(c => c.CandidateProfile)!.ThenInclude(p => p.CandidateEducations)
            .Include(a => a.Candidate).ThenInclude(c => c.CandidateProfile)!.ThenInclude(p => p.CandidateWorkExperiences)
            .Include(a => a.Candidate).ThenInclude(c => c.CandidateProfile)!.ThenInclude(p => p.CandidateSkills).ThenInclude(s => s.Skill)
            .Include(a => a.Interviews)
            .FirstOrDefaultAsync(a => a.Id == id && a.Job.Department.CompanyId == companyId, cancellationToken);

        if (application == null)
        {
            return NotFound(new { message = "Application not found." });
        }

        // Verify access (must be hiring manager or interviewer)
        if (application.Job.HiringManagerId != userId && !application.Interviews.Any(i => i.InterviewerId == userId))
        {
            return Forbid();
        }

        var profile = application.Candidate.CandidateProfile;

        var dto = new HiringManagerApplicationDetailDto
        {
            Id = application.Id,
            JobId = application.JobId,
            JobTitle = application.Job.Title,
            CandidateName = application.Candidate.FirstName + " " + application.Candidate.LastName,
            AppliedAt = application.AppliedAt,
            Status = application.Status,
            AiMatchScore = application.AiMatchScore,
            ScheduledTime = application.Interviews
                .Where(i => i.InterviewerId == userId && (i.Status == "Scheduled" || i.Status == "Confirmed" || i.Status == "Rescheduled"))
                .OrderBy(i => i.ScheduledTime)
                .Select(i => (DateTime?)i.ScheduledTime)
                .FirstOrDefault()
                ?? application.Interviews
                    .OrderBy(i => i.ScheduledTime)
                    .Select(i => (DateTime?)i.ScheduledTime)
                    .FirstOrDefault(),
            CoverLetterText = application.CoverLetterText,
            ResumeUrl = application.Document?.FileUrl,
            CandidateProfile = profile == null ? null : new HiringManagerCandidateProfileDto
            {
                FirstName = application.Candidate.FirstName,
                LastName = application.Candidate.LastName,
                Email = application.Candidate.Email,
                SummaryText = profile.SummaryText,
                PortfolioUrl = profile.PortfolioUrl,
                LinkedinUrl = profile.LinkedinUrl,
                GithubUrl = profile.GithubUrl,
                LocationCity = profile.LocationCity,
                LocationCountry = "Unknown", // Schema doesn't have country, usually part of city or profile
                YearsOfExperience = profile.YearsOfExperience,
                Skills = profile.CandidateSkills.Select(s => new HiringManagerCandidateSkillDto
                {
                    Name = s.Skill.Name,
                    ProficiencyLevel = s.ProficiencyLevel,
                    YearsOfExperience = s.YearsOfExperience,
                    ExtractedByAi = s.ExtractedByAi
                }).ToList(),
                Education = profile.CandidateEducations.Select(e => new HiringManagerCandidateEducationDto
                {
                    InstitutionName = e.InstitutionName,
                    Degree = e.Degree,
                    FieldOfStudy = e.FieldOfStudy,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsCurrent = e.IsCurrent,
                    Grade = e.Grade
                }).ToList(),
                WorkExperience = profile.CandidateWorkExperiences.Select(e => new HiringManagerCandidateExperienceDto
                {
                    CompanyName = e.CompanyName,
                    JobTitle = e.JobTitle,
                    Location = e.Location,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsCurrent = e.IsCurrent,
                    Description = e.Description
                }).ToList()
            }
        };

        return Ok(dto);
    }

    [HttpGet("interviews")]
    public async Task<ActionResult<List<InterviewDto>>> GetInterviews(CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var interviews = await _context.Interviews
            .AsNoTracking()
            .Include(i => i.Application).ThenInclude(a => a.Candidate)
            .Include(i => i.Application).ThenInclude(a => a.Job)
            .Include(i => i.Interviewer)
            .Where(i => i.Application.Job.Department.CompanyId == companyId &&
                        (i.Application.Job.HiringManagerId == userId || i.InterviewerId == userId))
            .OrderBy(i => i.ScheduledTime)
            .ToListAsync(cancellationToken);

        return Ok(interviews.Select(ToInterviewDto).ToList());
    }

    [HttpGet("interviews/{id:int}")]
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

    [HttpGet("interviews/application/{applicationId:int}")]
    public async Task<ActionResult<List<InterviewDto>>> GetInterviewsForApplication(int applicationId, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();

        var interviews = await _context.Interviews
            .AsNoTracking()
            .Include(i => i.Application).ThenInclude(a => a.Candidate)
            .Include(i => i.Application).ThenInclude(a => a.Job)
            .Include(i => i.Interviewer)
            .Where(i => i.ApplicationId == applicationId &&
                        i.Application.Job.Department.CompanyId == companyId)
            .OrderBy(i => i.ScheduledTime)
            .ToListAsync(cancellationToken);

        return Ok(interviews.Select(ToInterviewDto).ToList());
    }

    [HttpGet("evaluations/interview/{interviewId:int}")]
    public async Task<ActionResult<EvaluationDto>> GetEvaluationForInterview(int interviewId, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var evaluation = await _context.Evaluations
            .AsNoTracking()
            .Include(e => e.Interview).ThenInclude(i => i.Application).ThenInclude(a => a.Job).ThenInclude(j => j.Department)
            .FirstOrDefaultAsync(e => e.InterviewId == interviewId && e.Interview.Application.Job.Department.CompanyId == companyId, cancellationToken);

        if (evaluation == null)
        {
            return NotFound(new { message = "Evaluation not found." });
        }

        if (evaluation.Interview.InterviewerId != userId)
        {
            return Forbid();
        }

        return Ok(new EvaluationDto
        {
            Id = evaluation.Id,
            InterviewId = evaluation.InterviewId,
            EvaluatedBy = evaluation.EvaluatedBy,
            OverallScore = evaluation.OverallScore,
            FeedbackText = evaluation.FeedbackText,
            StrengthsText = evaluation.StrengthsText,
            ConcernsText = evaluation.ConcernsText,
            HireRecommendation = evaluation.HireRecommendation,
            SubmittedAt = evaluation.SubmittedAt
        });
    }

    [HttpPost("evaluations")]
    public async Task<ActionResult<EvaluationDto>> SubmitEvaluation([FromBody] SubmitEvaluationDto request, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var interview = await _context.Interviews
            .Include(i => i.Application).ThenInclude(a => a.Job).ThenInclude(j => j.Department)
            .FirstOrDefaultAsync(i => i.Id == request.InterviewId && i.Application.Job.Department.CompanyId == companyId, cancellationToken);

        if (interview == null)
        {
            return NotFound(new { message = "Interview not found." });
        }

        if (interview.InterviewerId != userId)
        {
            return Forbid();
        }

        var existingEvaluation = await _context.Evaluations
            .AnyAsync(e => e.InterviewId == request.InterviewId, cancellationToken);

        if (existingEvaluation)
        {
            return BadRequest(new { message = "An evaluation has already been submitted for this interview." });
        }

        var evaluation = new Evaluation
        {
            InterviewId = request.InterviewId,
            EvaluatedBy = userId,
            OverallScore = request.OverallScore,
            FeedbackText = request.FeedbackText ?? "",
            StrengthsText = request.StrengthsText,
            ConcernsText = request.ConcernsText,
            HireRecommendation = request.HireRecommendation,
            SubmittedAt = DateTime.UtcNow
        };

        _context.Evaluations.Add(evaluation);

        interview.Status = "Completed";
        interview.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new EvaluationDto
        {
            Id = evaluation.Id,
            InterviewId = evaluation.InterviewId,
            EvaluatedBy = evaluation.EvaluatedBy,
            OverallScore = evaluation.OverallScore,
            FeedbackText = evaluation.FeedbackText,
            StrengthsText = evaluation.StrengthsText,
            ConcernsText = evaluation.ConcernsText,
            HireRecommendation = evaluation.HireRecommendation,
            SubmittedAt = evaluation.SubmittedAt
        });
    }

    [HttpGet("offers/application/{applicationId:int}")]
    public async Task<ActionResult<OfferDto>> GetOfferForApplication(int applicationId, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var offer = await _context.Offers
            .AsNoTracking()
            .Include(o => o.Application).ThenInclude(a => a.Job).ThenInclude(j => j.Department)
            .Include(o => o.Application).ThenInclude(a => a.Interviews)
            .FirstOrDefaultAsync(o => o.ApplicationId == applicationId && o.Application.Job.Department.CompanyId == companyId, cancellationToken);

        if (offer == null)
        {
            return NotFound(new { message = "Offer not found." });
        }

        var isAuthorized = offer.Application.Job.HiringManagerId == userId ||
            offer.Application.Interviews.Any(i => i.InterviewerId == userId) ||
            offer.Application.Job.HiringManagerId == null;

        if (!isAuthorized)
        {
            return Forbid();
        }

        return Ok(new OfferDto
        {
            Id = offer.Id,
            ApplicationId = offer.ApplicationId,
            OfferedSalary = offer.OfferedSalary,
            SalaryCurrency = offer.SalaryCurrency,
            ProposedStartDate = offer.ProposedStartDate,
            OfferExpiryDate = offer.OfferExpiryDate,
            Status = offer.Status,
            Notes = offer.Notes,
            ManagedBy = offer.ManagedBy,
            CreatedAt = offer.CreatedAt
        });
    }

    [HttpGet("offers")]
    public async Task<ActionResult<List<OfferListDto>>> GetOffers(CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var offers = await _context.Offers
            .AsNoTracking()
            .Where(o => o.Application.Job.Department.CompanyId == companyId &&
                        (o.Application.Job.HiringManagerId == userId ||
                         o.Application.Interviews.Any(i => i.InterviewerId == userId) ||
                         o.Application.Job.HiringManagerId == null))
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OfferListDto
            {
                Id = o.Id,
                ApplicationId = o.ApplicationId,
                CandidateName = o.Application.Candidate.FirstName + " " + o.Application.Candidate.LastName,
                JobTitle = o.Application.Job.Title,
                Status = o.Status,
                OfferedSalary = o.OfferedSalary,
                SalaryCurrency = o.SalaryCurrency,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(offers);
    }

    [HttpPost("offers")]
    public async Task<ActionResult<OfferDto>> SubmitOffer([FromBody] SubmitOfferDto request, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var application = await _context.Applications
            .Include(a => a.Job).ThenInclude(j => j.Department)
            .Include(a => a.Interviews)
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId && a.Job.Department.CompanyId == companyId, cancellationToken);

        if (application == null)
        {
            return NotFound(new { message = "Application not found." });
        }

        var canCreateOffer = application.Job.Department.CompanyId == companyId;

        if (!canCreateOffer)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "You are not authorized to create an offer for this application." });
        }

        var existingOffer = await _context.Offers
            .AnyAsync(o => o.ApplicationId == request.ApplicationId, cancellationToken);

        if (existingOffer)
        {
            return BadRequest(new { message = "An offer has already been initiated for this application." });
        }

        var offer = new Offer
        {
            ApplicationId = request.ApplicationId,
            OfferedSalary = request.OfferedSalary,
            SalaryCurrency = request.SalaryCurrency,
            ProposedStartDate = request.ProposedStartDate,
            OfferExpiryDate = request.OfferExpiryDate,
            Status = "Pending",
            Notes = request.Notes,
            ManagedBy = (int?)null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Offers.Add(offer);

        if (!application.Status.Equals("Offer Extended", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                await _applicationStatusService.ChangeStatusAsync(
                    application.Id,
                    "Offer Extended",
                    userId,
                    "Offer initiated.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new OfferDto
        {
            Id = offer.Id,
            ApplicationId = offer.ApplicationId,
            OfferedSalary = offer.OfferedSalary,
            SalaryCurrency = offer.SalaryCurrency,
            ProposedStartDate = offer.ProposedStartDate,
            OfferExpiryDate = offer.OfferExpiryDate,
            Status = offer.Status,
            Notes = offer.Notes,
            ManagedBy = offer.ManagedBy,
            CreatedAt = offer.CreatedAt
        });
    }

    private static InterviewDto ToInterviewDto(Interview interview)
    {
        return new InterviewDto
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
}

public class HiringManagerJobDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string DepartmentName { get; set; } = "";
    public int ShortlistedCount { get; set; }
    public int InterviewingCount { get; set; }
}

public class HiringManagerApplicationListDto
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string JobTitle { get; set; } = "";
    public string CandidateName { get; set; } = "";
    public DateTime AppliedAt { get; set; }
    public string Status { get; set; } = "";
    public decimal? AiMatchScore { get; set; }
    public DateTime? ScheduledTime { get; set; }
}

public class HiringManagerApplicationDetailDto : HiringManagerApplicationListDto
{
    public string? CoverLetterText { get; set; }
    public string? ResumeUrl { get; set; }
    public HiringManagerCandidateProfileDto? CandidateProfile { get; set; }
}

public class HiringManagerCandidateProfileDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? SummaryText { get; set; }
    public string? PortfolioUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? LocationCity { get; set; }
    public string? LocationCountry { get; set; }
    public int? YearsOfExperience { get; set; }
    public List<HiringManagerCandidateSkillDto> Skills { get; set; } = new();
    public List<HiringManagerCandidateEducationDto> Education { get; set; } = new();
    public List<HiringManagerCandidateExperienceDto> WorkExperience { get; set; } = new();
}

public class HiringManagerCandidateSkillDto
{
    public string Name { get; set; } = "";
    public string? ProficiencyLevel { get; set; }
    public int? YearsOfExperience { get; set; }
    public bool ExtractedByAi { get; set; }
}

public class HiringManagerCandidateEducationDto
{
    public string InstitutionName { get; set; } = "";
    public string Degree { get; set; } = "";
    public string FieldOfStudy { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Grade { get; set; }
}

public class HiringManagerCandidateExperienceDto
{
    public string CompanyName { get; set; } = "";
    public string JobTitle { get; set; } = "";
    public string? Location { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Description { get; set; }
}
