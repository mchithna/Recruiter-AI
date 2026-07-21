using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/offers")]
[Authorize(Roles = "Recruiter")]
public class OffersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IApplicationStatusService _applicationStatusService;

    public OffersController(ApplicationDbContext context, IApplicationStatusService applicationStatusService)
    {
        _context = context;
        _applicationStatusService = applicationStatusService;
    }

    [HttpGet("application/{applicationId:int}")]
    public async Task<ActionResult<OfferDto>> GetOfferForApplication(int applicationId, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var offer = await _context.Offers
            .AsNoTracking()
            .Include(o => o.Application).ThenInclude(a => a.Job).ThenInclude(j => j.Department)
            .FirstOrDefaultAsync(o => o.ApplicationId == applicationId && o.Application.Job.Department.CompanyId == companyId, cancellationToken);

        if (offer == null)
        {
            return NotFound(new { message = "Offer not found." });
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

    [HttpGet]
    public async Task<ActionResult<List<OfferListDto>>> GetOffers(CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var query = _context.Offers
            .AsNoTracking()
            .Where(o => o.Application.Job.Department.CompanyId == companyId);

        var offers = await query
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

    [HttpPost]
    public async Task<ActionResult<OfferDto>> SubmitOffer([FromBody] SubmitOfferDto request, CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var application = await _context.Applications
            .Include(a => a.Job).ThenInclude(j => j.Department)
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId && a.Job.Department.CompanyId == companyId, cancellationToken);

        if (application == null)
        {
            return NotFound(new { message = "Application not found." });
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
            ManagedBy = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Offers.Add(offer);

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

public class OfferDto
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public decimal? OfferedSalary { get; set; }
    public string? SalaryCurrency { get; set; }
    public DateOnly? ProposedStartDate { get; set; }
    public DateOnly? OfferExpiryDate { get; set; }
    public string Status { get; set; } = "";
    public string? Notes { get; set; }
    public int? ManagedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class OfferListDto
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public string CandidateName { get; set; } = "";
    public string JobTitle { get; set; } = "";
    public string Status { get; set; } = "";
    public decimal? OfferedSalary { get; set; }
    public string? SalaryCurrency { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SubmitOfferDto
{
    public int ApplicationId { get; set; }
    public decimal? OfferedSalary { get; set; }
    public string? SalaryCurrency { get; set; }
    public DateOnly? ProposedStartDate { get; set; }
    public DateOnly? OfferExpiryDate { get; set; }
    public string? Notes { get; set; }
}
