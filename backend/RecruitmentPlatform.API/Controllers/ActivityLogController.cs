using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Core.DTOs.ActivityLog;
using RecruitmentPlatform.Core.Interfaces;
using System.Security.Claims;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/activity-log")]
[Authorize(Roles = "Admin")]
public class ActivityLogController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ActivityLogController(IUnitOfWork unitOfWork)
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

    [HttpGet]
    public async Task<ActionResult<ActivityLogPagedResponseDto>> GetLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var companyId = GetCompanyId();
        
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 50;

        var (items, totalCount) = await _unitOfWork.AuditLogs.GetPagedAsync(
            predicate: log => log.User != null && log.User.CompanyId == companyId,
            page: page,
            pageSize: pageSize,
            orderBy: query => query.OrderByDescending(x => x.OccurredAt),
            includes: log => log.User!
        );

        var dtoItems = items.Select(log => new ActivityLogDto
        {
            Id = (int)log.Id,
            ActorFirstName = log.User?.FirstName,
            ActorLastName = log.User?.LastName,
            Action = log.Action,
            EntityType = log.EntityType ?? string.Empty,
            EntityId = log.EntityId,
            OccurredAt = log.OccurredAt
        });

        var response = new ActivityLogPagedResponseDto
        {
            Items = dtoItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(response);
    }
}
