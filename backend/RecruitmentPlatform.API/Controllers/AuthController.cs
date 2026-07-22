using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;
using RecruitmentPlatform.Core.Helpers;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public AuthController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet("invite/validate")]
    [AllowAnonymous]
    public async Task<IActionResult> ValidateInvite([FromQuery] string token)
    {
        if (string.IsNullOrEmpty(token)) return BadRequest(new { message = "Token is required." });

        var tokenHash = SecurityHelper.HashToken(token);
        
        var invitation = await _unitOfWork.UserInvitations.FirstOrDefaultAsync(
            i => i.InvitationTokenHash == tokenHash,
            i => i.Role,
            i => i.Company,
            i => i.Department);

        if (invitation == null)
        {
            return NotFound(new { message = "Invitation not found." });
        }

        if (invitation.Status != "Pending")
        {
            return BadRequest(new { message = $"Invitation is {invitation.Status}." });
        }

        if (invitation.ExpiresAt < DateTime.UtcNow)
        {
            invitation.Status = "Expired";
            _unitOfWork.UserInvitations.Update(invitation);
            await _unitOfWork.SaveChangesAsync();
            return BadRequest(new { message = "Invitation has expired." });
        }

        return Ok(new
        {
            email = invitation.Email,
            roleName = invitation.Role?.Name,
            companyName = invitation.Company?.Name,
            departmentName = invitation.Department?.Name
        });
    }

    [HttpPost("invite/complete")]
    [Authorize]
    public async Task<IActionResult> CompleteInvite([FromBody] CompleteInviteRequest request)
    {
        if (string.IsNullOrEmpty(request.Token)) return BadRequest(new { message = "Token is required." });

        var tokenHash = SecurityHelper.HashToken(request.Token);
        
        var invitation = await _unitOfWork.UserInvitations.FirstOrDefaultAsync(
            i => i.InvitationTokenHash == tokenHash,
            i => i.Role);

        if (invitation == null)
        {
            return NotFound(new { message = "Invitation not found." });
        }

        if (invitation.Status != "Pending")
        {
            return BadRequest(new { message = $"Invitation is {invitation.Status}." });
        }

        if (invitation.ExpiresAt < DateTime.UtcNow)
        {
            invitation.Status = "Expired";
            _unitOfWork.UserInvitations.Update(invitation);
            await _unitOfWork.SaveChangesAsync();
            return BadRequest(new { message = "Invitation has expired." });
        }

        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var supabaseUserId))
        {
            return BadRequest(new { message = "Invalid token claims." });
        }

        // Idempotency check: in case they somehow retry
        var existingUser = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.SupabaseUserId == supabaseUserId, u => u.Role);
        if (existingUser != null)
        {
            existingUser.RoleId = invitation.RoleId;
            existingUser.Role = invitation.Role;
            existingUser.CompanyId = invitation.CompanyId;
            existingUser.DepartmentId = invitation.DepartmentId;
            existingUser.FirstName = request.FirstName;
            existingUser.LastName = request.LastName;
            existingUser.Email = invitation.Email;
            existingUser.IsActive = true;
            existingUser.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Users.Update(existingUser);

            // If they already have a user row, repair it from the invitation and mark accepted.
            if (invitation.Status == "Pending")
            {
                invitation.Status = "Accepted";
                _unitOfWork.UserInvitations.Update(invitation);
            }

            await _unitOfWork.SaveChangesAsync();
            return Ok(MapToResponse(existingUser));
        }

        var newUser = new User
        {
            RoleId = invitation.RoleId,
            Role = invitation.Role,
            CompanyId = invitation.CompanyId,
            DepartmentId = invitation.DepartmentId,
            SupabaseUserId = supabaseUserId,
            Email = invitation.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(newUser);
        
        invitation.Status = "Accepted";
        _unitOfWork.UserInvitations.Update(invitation);
        
        await _unitOfWork.SaveChangesAsync();

        return Ok(MapToResponse(newUser));
    }
    private AuthProfileResponse MapToResponse(User user)
    {
        return new AuthProfileResponse
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

public class CompleteInviteRequest
{
    public string Token { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
}

public class AuthProfileResponse
{
    public int AppUserId { get; set; }
    public string? Role { get; set; }
    public int? CompanyId { get; set; }
    public int? DepartmentId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}
