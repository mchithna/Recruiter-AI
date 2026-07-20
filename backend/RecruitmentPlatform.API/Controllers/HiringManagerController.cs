using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/hiring-manager")]
[Authorize(Roles = "HiringManager")]
public class HiringManagerController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HiringManagerController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("queue")]
    public async Task<ActionResult<List<HiringManagerApplicationListDto>>> GetQueue(CancellationToken cancellationToken)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var applications = await _context.Applications
            .AsNoTracking()
            .Where(a => a.Job.Department.CompanyId == companyId)
            .Where(a => a.Job.HiringManagerId == userId || a.Interviews.Any(i => i.InterviewerId == userId))
            .Where(a => a.Status == "Shortlisted" || a.Status == "Interview Scheduled" || a.Status == "Offer Extended" || a.Status == "Hired" || a.Status == "Rejected")
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => new HiringManagerApplicationListDto
            {
                Id = a.Id,
                JobId = a.JobId,
                JobTitle = a.Job.Title,
                CandidateName = a.Candidate.FirstName + " " + a.Candidate.LastName,
                AppliedAt = a.AppliedAt,
                Status = a.Status,
                AiMatchScore = a.AiMatchScore
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

public class HiringManagerApplicationListDto
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string JobTitle { get; set; } = "";
    public string CandidateName { get; set; } = "";
    public DateTime AppliedAt { get; set; }
    public string Status { get; set; } = "";
    public decimal? AiMatchScore { get; set; }
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
