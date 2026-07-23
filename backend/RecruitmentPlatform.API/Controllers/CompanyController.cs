using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Core.DTOs;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;
using System.Security.Claims;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/company")]
[Authorize(Roles = "Admin")]
public class CompanyController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _auditLogger;

    public CompanyController(IUnitOfWork unitOfWork, IAuditLogger auditLogger)
    {
        _unitOfWork = unitOfWork;
        _auditLogger = auditLogger;
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

    private int? GetAppUserId()
    {
        var appUserIdClaim = User.FindFirst("app_user_id")?.Value;
        if (int.TryParse(appUserIdClaim, out var appUserId))
        {
            return appUserId;
        }
        return null;
    }

    [HttpGet("me")]
    public async Task<ActionResult<CompanyDto>> GetMyCompany()
    {
        var companyId = GetCompanyId();
        var company = await _unitOfWork.Companies.GetByIdAsync(companyId);

        if (company == null)
        {
            return NotFound("Company not found.");
        }

        var companyDto = new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Industry = company.Industry,
            WebsiteUrl = company.WebsiteUrl,
            LogoUrl = company.LogoUrl,
            Address = company.Address,
            SubscriptionStatus = company.SubscriptionStatus,
            CreatedAt = company.CreatedAt,
            UpdatedAt = company.UpdatedAt
        };

        return Ok(companyDto);
    }

    [HttpPut("me")]
    public async Task<ActionResult<CompanyDto>> UpdateMyCompany(UpdateCompanyDto updateDto)
    {
        var companyId = GetCompanyId();
        var company = await _unitOfWork.Companies.GetByIdAsync(companyId);

        if (company == null)
        {
            return NotFound("Company not found.");
        }

        var oldValue = new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Industry = company.Industry,
            WebsiteUrl = company.WebsiteUrl,
            LogoUrl = company.LogoUrl,
            Address = company.Address,
            SubscriptionStatus = company.SubscriptionStatus,
            CreatedAt = company.CreatedAt,
            UpdatedAt = company.UpdatedAt
        };

        company.Name = updateDto.Name;
        company.Industry = updateDto.Industry;
        company.WebsiteUrl = updateDto.WebsiteUrl;
        company.LogoUrl = updateDto.LogoUrl;
        company.Address = updateDto.Address;
        company.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Companies.Update(company);
        await _unitOfWork.SaveChangesAsync();

        var newValue = new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Industry = company.Industry,
            WebsiteUrl = company.WebsiteUrl,
            LogoUrl = company.LogoUrl,
            Address = company.Address,
            SubscriptionStatus = company.SubscriptionStatus,
            CreatedAt = company.CreatedAt,
            UpdatedAt = company.UpdatedAt
        };

        await _auditLogger.LogAsync(
            userId: GetAppUserId(),
            action: "COMPANY_UPDATED",
            entityType: "Company",
            entityId: company.Id,
            oldValue: oldValue,
            newValue: newValue
        );

        return Ok(newValue);
    }

    [HttpPost("subscription/activate")]
    public async Task<ActionResult<CompanyDto>> ActivateSubscription([FromBody] ActivateSubscriptionRequest? request)
    {
        var companyId = GetCompanyId();
        var company = await _unitOfWork.Companies.GetByIdAsync(companyId);

        if (company == null)
        {
            return NotFound("Company not found.");
        }

        var oldValue = new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Industry = company.Industry,
            WebsiteUrl = company.WebsiteUrl,
            LogoUrl = company.LogoUrl,
            Address = company.Address,
            SubscriptionStatus = company.SubscriptionStatus,
            CreatedAt = company.CreatedAt,
            UpdatedAt = company.UpdatedAt
        };

        company.SubscriptionStatus = "Active";
        company.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Companies.Update(company);
        await _unitOfWork.SaveChangesAsync();

        var newValue = new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Industry = company.Industry,
            WebsiteUrl = company.WebsiteUrl,
            LogoUrl = company.LogoUrl,
            Address = company.Address,
            SubscriptionStatus = company.SubscriptionStatus,
            CreatedAt = company.CreatedAt,
            UpdatedAt = company.UpdatedAt
        };

        await _auditLogger.LogAsync(
            userId: GetAppUserId(),
            action: "SUBSCRIPTION_ACTIVATED",
            entityType: "Company",
            entityId: company.Id,
            oldValue: oldValue,
            newValue: newValue
        );

        return Ok(newValue);
    }
}

public class ActivateSubscriptionRequest
{
    public string? OrderId { get; set; }
    public string? PaymentMethod { get; set; }
    public bool IsManualTest { get; set; }
}
