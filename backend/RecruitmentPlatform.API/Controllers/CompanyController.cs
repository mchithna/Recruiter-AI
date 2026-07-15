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

    public CompanyController(IUnitOfWork unitOfWork)
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

        company.Name = updateDto.Name;
        company.Industry = updateDto.Industry;
        company.WebsiteUrl = updateDto.WebsiteUrl;
        company.LogoUrl = updateDto.LogoUrl;
        company.Address = updateDto.Address;
        company.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Companies.Update(company);
        await _unitOfWork.SaveChangesAsync();

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
}
