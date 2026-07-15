using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Core.DTOs.Invitations;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Helpers;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class InvitationsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationFactory _notificationFactory;
    private readonly IConfiguration _configuration;

    public InvitationsController(
        IUnitOfWork unitOfWork,
        INotificationFactory notificationFactory,
        IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _notificationFactory = notificationFactory;
        _configuration = configuration;
    }

    [HttpPost]
    public async Task<IActionResult> CreateInvitation([FromBody] CreateInvitationRequest request)
    {
        if (request.RoleName != "Recruiter" && request.RoleName != "HiringManager")
        {
            return BadRequest(new { message = "Admins can only invite Recruiter or HiringManager roles." });
        }

        var companyIdClaim = User.FindFirst("company_id")?.Value;
        if (string.IsNullOrEmpty(companyIdClaim) || !int.TryParse(companyIdClaim, out var companyId))
        {
            return Unauthorized(new { message = "Invalid or missing company ID." });
        }

        var appUserIdClaim = User.FindFirst("app_user_id")?.Value;
        if (string.IsNullOrEmpty(appUserIdClaim) || !int.TryParse(appUserIdClaim, out var appUserId))
        {
            return Unauthorized(new { message = "Invalid or missing app user ID." });
        }

        Department? department = null;
        if (request.DepartmentId.HasValue)
        {
            department = await _unitOfWork.Departments.FirstOrDefaultAsync(d => d.Id == request.DepartmentId.Value && d.CompanyId == companyId);
            if (department == null)
            {
                return BadRequest(new { message = "Invalid department for this company." });
            }
        }

        var role = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Name == request.RoleName);
        if (role == null)
        {
            return BadRequest(new { message = $"Role '{request.RoleName}' not found." });
        }
        
        var company = await _unitOfWork.Companies.GetByIdAsync(companyId);
        if (company == null)
        {
            return BadRequest(new { message = "Company not found." });
        }

        var rawToken = Guid.NewGuid().ToString("N");
        var tokenHash = SecurityHelper.HashToken(rawToken);
        var expiresAt = DateTime.UtcNow.AddDays(7);

        var invitation = new UserInvitation
        {
            CompanyId = companyId,
            InvitedBy = appUserId,
            Email = request.Email,
            RoleId = role.Id,
            DepartmentId = request.DepartmentId,
            InvitationTokenHash = tokenHash,
            ExpiresAt = expiresAt,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.UserInvitations.AddAsync(invitation);
        await _unitOfWork.SaveChangesAsync();

        var baseUrl = _configuration.GetValue<string>("FrontendSettings:BaseUrl")?.TrimEnd('/');
        var acceptUrl = $"{baseUrl}/invite/accept?token={rawToken}";

        try
        {
            var emailService = _notificationFactory.Create("Email");
            var subject = $"You've been invited to join {company.Name}";
            
            var deptString = department != null ? $" in the {department.Name} department" : "";
            var htmlBody = $@"
                <p>Hello,</p>
                <p>You have been invited to join <strong>{company.Name}</strong> as a <strong>{role.Name}</strong>{deptString}.</p>
                <p>Please click the link below to accept your invitation:</p>
                <p><a href='{acceptUrl}'>Accept Invitation</a></p>
                <p>This link expires on {expiresAt:MMMM d, yyyy 'at' h:mm tt} UTC.</p>
            ";

            await emailService.SendEmailAsync(request.Email, subject, htmlBody);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send invitation email: {ex.Message}");
            // Continue without failing the request
        }

        return Ok(new CreateInvitationResponse
        {
            InvitationId = invitation.Id,
            Email = invitation.Email,
            RoleName = role.Name,
            DepartmentName = department?.Name,
            AcceptUrl = acceptUrl
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetInvitations([FromQuery] int? departmentId)
    {
        var companyIdClaim = User.FindFirst("company_id")?.Value;
        if (string.IsNullOrEmpty(companyIdClaim) || !int.TryParse(companyIdClaim, out var companyId))
        {
            return Unauthorized(new { message = "Invalid or missing company ID." });
        }

        var query = await _unitOfWork.UserInvitations.FindAsync(i => i.CompanyId == companyId && (!departmentId.HasValue || i.DepartmentId == departmentId.Value));
        
        // Ensure we load navigation properties.
        // Wait, FindAsync might not load related entities if not using eager loading explicitly depending on the repo implementation. 
        // But since this is a simple implementation, let's load what we can or rely on lazy loading if configured.
        // We will just map it. If Role or Department is null, we can fetch them manually or assume they are loaded.
        // The prompt says return roleName and departmentName. Let's make sure we have them. 
        // We might need to get them if not loaded.
        
        var invitations = query.ToList();
        
        // Manually fetch roles and departments to avoid N+1 if lazy loading isn't on or doesn't work.
        var roles = await _unitOfWork.Roles.GetAllAsync();
        var departments = await _unitOfWork.Departments.FindAsync(d => d.CompanyId == companyId);
        
        var response = invitations.Select(i => new InvitationListResponse
        {
            Id = i.Id,
            Email = i.Email,
            RoleName = roles.FirstOrDefault(r => r.Id == i.RoleId)?.Name ?? "Unknown",
            DepartmentName = departments.FirstOrDefault(d => d.Id == i.DepartmentId)?.Name,
            Status = i.Status,
            CreatedAt = i.CreatedAt,
            ExpiresAt = i.ExpiresAt
        }).ToList();

        return Ok(response);
    }

    [HttpPost("{id}/revoke")]
    public async Task<IActionResult> RevokeInvitation(int id)
    {
        var companyIdClaim = User.FindFirst("company_id")?.Value;
        if (string.IsNullOrEmpty(companyIdClaim) || !int.TryParse(companyIdClaim, out var companyId))
        {
            return Unauthorized(new { message = "Invalid or missing company ID." });
        }

        var invitation = await _unitOfWork.UserInvitations.FirstOrDefaultAsync(i => i.Id == id && i.CompanyId == companyId);
        if (invitation == null)
        {
            return NotFound(new { message = "Invitation not found." });
        }

        if (invitation.Status != "Pending")
        {
            return BadRequest(new { message = $"Cannot revoke invitation because it is already {invitation.Status}." });
        }

        invitation.Status = "Revoked";
        _unitOfWork.UserInvitations.Update(invitation);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Invitation revoked successfully." });
    }
}
