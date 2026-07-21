using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/evaluations")]
[Authorize(Roles = "HiringManager,Recruiter")]
public class EvaluationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IApplicationStatusService _applicationStatusService;

    public EvaluationsController(ApplicationDbContext context, IApplicationStatusService applicationStatusService)
    {
        _context = context;
        _applicationStatusService = applicationStatusService;
    }

    [HttpGet("interview/{interviewId:int}")]
    public async Task<ActionResult<EvaluationDto>> GetEvaluationForInterview(int interviewId, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();
        var isRecruiter = User.IsInRole("Recruiter");

        var evaluation = await _context.Evaluations
            .AsNoTracking()
            .Include(e => e.Interview).ThenInclude(i => i.Application).ThenInclude(a => a.Job).ThenInclude(j => j.Department)
            .FirstOrDefaultAsync(e => e.InterviewId == interviewId && e.Interview.Application.Job.Department.CompanyId == companyId, cancellationToken);

        if (evaluation == null)
        {
            return NotFound(new { message = "Evaluation not found." });
        }

        if (!isRecruiter && evaluation.Interview.InterviewerId != userId)
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

    [HttpPost]
    public async Task<ActionResult<EvaluationDto>> SubmitEvaluation([FromBody] SubmitEvaluationDto request, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();
        var isRecruiter = User.IsInRole("Recruiter");

        var interview = await _context.Interviews
            .Include(i => i.Application).ThenInclude(a => a.Job).ThenInclude(j => j.Department)
            .FirstOrDefaultAsync(i => i.Id == request.InterviewId && i.Application.Job.Department.CompanyId == companyId, cancellationToken);

        if (interview == null)
        {
            return NotFound(new { message = "Interview not found." });
        }

        if (!isRecruiter && interview.InterviewerId != userId)
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

public class EvaluationDto
{
    public int Id { get; set; }
    public int InterviewId { get; set; }
    public int EvaluatedBy { get; set; }
    public int OverallScore { get; set; }
    public string? FeedbackText { get; set; }
    public string? StrengthsText { get; set; }
    public string? ConcernsText { get; set; }
    public bool HireRecommendation { get; set; }
    public DateTime SubmittedAt { get; set; }
}

public class SubmitEvaluationDto
{
    public int InterviewId { get; set; }
    public int OverallScore { get; set; }
    public string? FeedbackText { get; set; }
    public string? StrengthsText { get; set; }
    public string? ConcernsText { get; set; }
    public bool HireRecommendation { get; set; }
}
