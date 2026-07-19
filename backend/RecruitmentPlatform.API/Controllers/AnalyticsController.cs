using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Core.DTOs.Analytics;
using RecruitmentPlatform.Core.Interfaces;
using System.Security.Claims;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize(Roles = "Admin")]
public class AnalyticsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public AnalyticsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    private int GetCompanyId()
    {
        var companyIdClaim = User.FindFirst("company_id")?.Value;
        if (int.TryParse(companyIdClaim, out var companyId))
        {
            return companyId;
        }
        throw new UnauthorizedAccessException("Company ID claim is missing or invalid.");
    }

    [HttpGet("overview")]
    public async Task<ActionResult<AnalyticsOverviewDto>> GetOverview()
    {
        var companyId = GetCompanyId();

        var jobsQuery = _unitOfWork.Jobs.Query()
            .Where(j => j.Department.CompanyId == companyId);
            
        // We assume "Open" represents active, open jobs.
        var totalOpenJobs = await jobsQuery.CountAsync(j => j.Status == "Open" || j.Status == "Published");

        var appsQuery = _unitOfWork.Applications.Query()
            .Where(a => a.Job.Department.CompanyId == companyId);

        var totalApplications = await appsQuery.CountAsync();

        var statuses = await appsQuery
            .GroupBy(a => a.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        int totalShortlisted = statuses.FirstOrDefault(s => s.Status == "Shortlisted")?.Count ?? 0;
        int totalInterviewsScheduled = statuses.Where(s => s.Status == "Scheduled" || s.Status == "Confirmed").Sum(s => s.Count);
        
        // "Sent" or later (Sent, Accepted, Hired, Offered)
        var offerStatuses = new[] { "Sent", "Offered", "Accepted", "Hired" };
        int totalOffersExtended = statuses.Where(s => offerStatuses.Contains(s.Status)).Sum(s => s.Count);
        
        int totalHires = statuses.FirstOrDefault(s => s.Status == "Hired")?.Count ?? 0;

        var applicationsByStatus = statuses.Select(s => new ApplicationStatusCountDto
        {
            Status = s.Status,
            Count = s.Count
        }).ToList();

        var avgAiMatchScore = await appsQuery
            .Where(a => a.AiMatchScore != null)
            .AverageAsync(a => (double?)a.AiMatchScore);

        var dto = new AnalyticsOverviewDto
        {
            TotalOpenJobs = totalOpenJobs,
            TotalApplications = totalApplications,
            TotalShortlisted = totalShortlisted,
            TotalInterviewsScheduled = totalInterviewsScheduled,
            TotalOffersExtended = totalOffersExtended,
            TotalHires = totalHires,
            AvgAiMatchScore = avgAiMatchScore,
            ApplicationsByStatus = applicationsByStatus
        };

        // Future possible addition:
        // Average time-to-hire could be calculated here, but it would require 
        // complex join logic across multiple date fields which isn't necessary right now.

        return Ok(dto);
    }
}
