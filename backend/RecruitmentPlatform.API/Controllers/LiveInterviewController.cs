using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.API.Chat;
using RecruitmentPlatform.Core.DTOs;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/live-interviews")]
[Authorize(Roles = "Recruiter,HiringManager")]
public class LiveInterviewController : ControllerBase
{
    private readonly ILiveInterviewService _liveInterviewService;
    private readonly IChatRateLimiter _rateLimiter;

    public LiveInterviewController(ILiveInterviewService liveInterviewService, IChatRateLimiter rateLimiter)
    {
        _liveInterviewService = liveInterviewService;
        _rateLimiter = rateLimiter;
    }

    [HttpPost("start")]
    public async Task<IActionResult> Start([FromBody] StartInterviewSessionRequest request, CancellationToken cancellationToken)
    {
        if (!IsRateAllowed("start")) return RateLimited();
        var result = await _liveInterviewService.StartSessionAsync(request, GetUserId(), GetRole(), GetCompanyId(), cancellationToken);
        return result == null ? NotFound(new { message = "Interview not found or not accessible." }) : Ok(result);
    }

    [HttpGet("{sessionId:int}")]
    public async Task<IActionResult> GetSession(int sessionId, CancellationToken cancellationToken)
    {
        var result = await _liveInterviewService.GetSessionAsync(sessionId, GetUserId(), GetRole(), GetCompanyId(), cancellationToken);
        return result == null ? NotFound(new { message = "Interview session not found." }) : Ok(result);
    }

    [HttpPost("{sessionId:int}/questions/generate")]
    public async Task<IActionResult> GenerateQuestion(int sessionId, [FromBody] GenerateLiveQuestionRequest request, CancellationToken cancellationToken)
    {
        if (!IsRateAllowed($"question:{sessionId}")) return RateLimited();
        var result = await _liveInterviewService.GenerateQuestionAsync(sessionId, request, GetUserId(), GetRole(), GetCompanyId(), cancellationToken);
        return result == null ? AiUnavailable() : Ok(result);
    }

    [HttpPost("{sessionId:int}/answers")]
    public async Task<IActionResult> SubmitAnswer(int sessionId, [FromBody] SubmitCandidateAnswerRequest request, CancellationToken cancellationToken)
    {
        if (!IsRateAllowed($"answer:{sessionId}")) return RateLimited();
        var result = await _liveInterviewService.SubmitAnswerAsync(sessionId, request, GetUserId(), GetRole(), GetCompanyId(), cancellationToken);
        return result == null ? AiUnavailable() : Ok(result);
    }

    [HttpPost("{sessionId:int}/questions/{questionId:int}/ask")]
    public Task<IActionResult> MarkAsked(int sessionId, int questionId, CancellationToken cancellationToken) =>
        UpdateQuestionStatus(sessionId, questionId, "Asked", cancellationToken);

    [HttpPost("{sessionId:int}/questions/{questionId:int}/skip")]
    public Task<IActionResult> Skip(int sessionId, int questionId, CancellationToken cancellationToken) =>
        UpdateQuestionStatus(sessionId, questionId, "Skipped", cancellationToken);

    [HttpPost("{sessionId:int}/questions/{questionId:int}/save")]
    public Task<IActionResult> Save(int sessionId, int questionId, CancellationToken cancellationToken) =>
        UpdateQuestionStatus(sessionId, questionId, "Saved", cancellationToken);

    [HttpPost("{sessionId:int}/questions/{questionId:int}/report")]
    public Task<IActionResult> Report(int sessionId, int questionId, CancellationToken cancellationToken) =>
        UpdateQuestionStatus(sessionId, questionId, "Rejected", cancellationToken);

    [HttpPost("{sessionId:int}/end")]
    public async Task<IActionResult> End(int sessionId, CancellationToken cancellationToken)
    {
        var result = await _liveInterviewService.EndSessionAsync(sessionId, GetUserId(), GetRole(), GetCompanyId(), cancellationToken);
        return result == null ? NotFound(new { message = "Interview session not found." }) : Ok(result);
    }

    [HttpGet("{sessionId:int}/summary")]
    public async Task<IActionResult> GetSummary(int sessionId, CancellationToken cancellationToken)
    {
        var result = await _liveInterviewService.GetSummaryAsync(sessionId, GetUserId(), GetRole(), GetCompanyId(), cancellationToken);
        return result == null ? NotFound(new { message = "Interview summary not found." }) : Ok(result);
    }

    private async Task<IActionResult> UpdateQuestionStatus(int sessionId, int questionId, string status, CancellationToken cancellationToken)
    {
        var result = await _liveInterviewService.UpdateQuestionStatusAsync(sessionId, questionId, status, GetUserId(), GetRole(), GetCompanyId(), cancellationToken);
        return result == null ? NotFound(new { message = "Question not found or session has ended." }) : Ok(result);
    }

    private IActionResult AiUnavailable() =>
        StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = LiveInterviewMessages.AiUnavailable });

    private IActionResult RateLimited() =>
        StatusCode(StatusCodes.Status429TooManyRequests, new { message = "Too many AI interview requests. Please wait a moment and try again." });

    private bool IsRateAllowed(string feature) =>
        _rateLimiter.IsAllowed($"live-interview:{feature}:{GetUserId()}");

    private int GetUserId()
    {
        var value = User.FindFirst("app_user_id")?.Value;
        if (int.TryParse(value, out var userId)) return userId;
        throw new UnauthorizedAccessException("User ID claim is missing or invalid.");
    }

    private int GetCompanyId()
    {
        var value = User.FindFirst("company_id")?.Value;
        if (int.TryParse(value, out var companyId)) return companyId;
        throw new UnauthorizedAccessException("Company ID claim is missing or invalid.");
    }

    private string GetRole()
    {
        if (User.IsInRole("Recruiter")) return "Recruiter";
        if (User.IsInRole("HiringManager")) return "HiringManager";
        throw new UnauthorizedAccessException("Role claim is missing or invalid.");
    }
}
