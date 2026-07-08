using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;
using System.Security.Claims;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ProfileController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpPost("provision-candidate")]
    public async Task<IActionResult> ProvisionCandidate([FromBody] ProvisionCandidateRequest request)
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;

        if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var supabaseUserId) || string.IsNullOrEmpty(email))
        {
            return BadRequest(new { message = "Invalid token claims." });
        }

        var existingUser = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.SupabaseUserId == supabaseUserId, u => u.Role);
        if (existingUser != null)
        {
            return Ok(MapToResponse(existingUser));
        }

        var role = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Name == "Candidate");
        if (role == null) return StatusCode(500, new { message = "Candidate role not found." });

        var newUser = new User
        {
            RoleId = role.Id,
            Role = role,
            SupabaseUserId = supabaseUserId,
            Email = email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var candidateProfile = new CandidateProfile
        {
            User = newUser,
            ResumeParseStatus = "Pending",
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(newUser);
        await _unitOfWork.CandidateProfiles.AddAsync(candidateProfile);
        
        await _unitOfWork.SaveChangesAsync();

        return Ok(MapToResponse(newUser));
    }

    [HttpPost("provision-company-admin")]
    public async Task<IActionResult> ProvisionCompanyAdmin([FromBody] ProvisionCompanyAdminRequest request)
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;

        if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var supabaseUserId) || string.IsNullOrEmpty(email))
        {
            return BadRequest(new { message = "Invalid token claims." });
        }

        var existingUser = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.SupabaseUserId == supabaseUserId, u => u.Role);
        if (existingUser != null)
        {
            return Ok(MapToResponse(existingUser));
        }

        var role = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
        if (role == null) return StatusCode(500, new { message = "Admin role not found." });

        var newCompany = new Company
        {
            Name = request.CompanyName,
            SubscriptionStatus = "Active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var newUser = new User
        {
            RoleId = role.Id,
            Role = role,
            Company = newCompany,
            SupabaseUserId = supabaseUserId,
            Email = email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Companies.AddAsync(newCompany);
        await _unitOfWork.Users.AddAsync(newUser);
        
        await _unitOfWork.SaveChangesAsync();

        return Ok(MapToResponse(newUser));
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var appUserIdClaim = User.FindFirst("app_user_id")?.Value;
        if (string.IsNullOrEmpty(appUserIdClaim) || !int.TryParse(appUserIdClaim, out var appUserId))
        {
            return NotFound(new { message = "profile not provisioned" });
        }

        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == appUserId, u => u.Role);
        if (user == null)
        {
            return NotFound(new { message = "User not found in database" });
        }

        // Use the same helper method that provisioning uses to ensure consistent responses
        return Ok(MapToResponse(user));
    }

    private ProfileResponse MapToResponse(User user)
    {
        return new ProfileResponse
        {
            AppUserId = user.Id,
            Role = user.Role?.Name,
            CompanyId = user.CompanyId,
            DepartmentId = user.DepartmentId,
            FirstName = user.FirstName,
            LastName = user.LastName
        };
    }
}

public class ProvisionCandidateRequest
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
}

public class ProvisionCompanyAdminRequest
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
}

public class ProfileResponse
{
    public int AppUserId { get; set; }
    public string? Role { get; set; }
    public int? CompanyId { get; set; }
    public int? DepartmentId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}
