using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Core.DTOs.Staff;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Recruiter")]
public class StaffController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _auditLogger;

    public StaffController(IUnitOfWork unitOfWork, IAuditLogger auditLogger)
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

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<StaffDto>>> GetStaffByDepartment([FromQuery] int departmentId)
    {
        var companyId = GetCompanyId();
        
        var department = await _unitOfWork.Departments.FirstOrDefaultAsync(d => d.Id == departmentId && d.CompanyId == companyId);
        if (department == null)
        {
            return BadRequest(new { message = "Department not found or does not belong to your company." });
        }

        var users = await _unitOfWork.Users.FindAsync(u => u.CompanyId == companyId && u.DepartmentId == departmentId);
        var roles = await _unitOfWork.Roles.GetAllAsync();

        var staffDtos = users.Select(u => new StaffDto
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email,
            RoleName = roles.FirstOrDefault(r => r.Id == u.RoleId)?.Name ?? "Unknown",
            IsActive = u.IsActive,
            LastLoginAt = u.LastLoginAt,
            DepartmentId = u.DepartmentId
        })
        .Where(s => s.RoleName != "Admin" && s.RoleName != "Candidate")
        .ToList();

        return Ok(staffDtos);
    }

    [HttpGet("hiring-managers")]
    [Authorize(Roles = "Recruiter")]
    public async Task<ActionResult<IEnumerable<HiringManagerPickerDto>>> GetHiringManagers()
    {
        var companyId = GetCompanyId();

        var hiringManagerRole = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Name == "HiringManager");
        if (hiringManagerRole == null)
        {
            return Ok(Array.Empty<HiringManagerPickerDto>());
        }

        var hiringManagers = await _unitOfWork.Users.FindAsync(u =>
            u.CompanyId == companyId &&
            u.IsActive &&
            u.RoleId == hiringManagerRole.Id);

        var result = hiringManagers
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .Select(u => new HiringManagerPickerDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName
            })
            .ToList();

        return Ok(result);
    }

    [HttpPut("{userId}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Deactivate(int userId)
    {
        var companyId = GetCompanyId();

        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == userId && u.CompanyId == companyId);
        if (user == null)
        {
            return NotFound(new { message = "Staff member not found." });
        }

        var role = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Id == user.RoleId);
        if (role?.Name == "Admin" || role?.Name == "Candidate")
        {
            return BadRequest(new { message = "Cannot modify staff members with this role." });
        }

        var oldValue = new { user.Id, user.Email, user.IsActive, user.DepartmentId, user.RoleId };

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        var newValue = new { user.Id, user.Email, user.IsActive, user.DepartmentId, user.RoleId };

        await _auditLogger.LogAsync(
            userId: GetAppUserId(),
            action: "STAFF_DEACTIVATED",
            entityType: "User",
            entityId: user.Id,
            oldValue: oldValue,
            newValue: newValue
        );

        return Ok(new { message = "Staff member deactivated successfully." });
    }

    [HttpPut("{userId}/reactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reactivate(int userId)
    {
        var companyId = GetCompanyId();

        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == userId && u.CompanyId == companyId);
        if (user == null)
        {
            return NotFound(new { message = "Staff member not found." });
        }

        var role = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Id == user.RoleId);
        if (role?.Name == "Admin" || role?.Name == "Candidate")
        {
            return BadRequest(new { message = "Cannot modify staff members with this role." });
        }

        var oldValue = new { user.Id, user.Email, user.IsActive, user.DepartmentId, user.RoleId };

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        var newValue = new { user.Id, user.Email, user.IsActive, user.DepartmentId, user.RoleId };

        await _auditLogger.LogAsync(
            userId: GetAppUserId(),
            action: "STAFF_REACTIVATED",
            entityType: "User",
            entityId: user.Id,
            oldValue: oldValue,
            newValue: newValue
        );

        return Ok(new { message = "Staff member reactivated successfully." });
    }

    [HttpPut("{userId}/reassign-department")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ReassignDepartment(int userId, [FromBody] ReassignStaffDto request)
    {
        var companyId = GetCompanyId();

        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == userId && u.CompanyId == companyId);
        if (user == null)
        {
            return NotFound(new { message = "Staff member not found." });
        }

        var role = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Id == user.RoleId);
        if (role?.Name == "Admin" || role?.Name == "Candidate")
        {
            return BadRequest(new { message = "Cannot modify staff members with this role." });
        }

        var newDepartment = await _unitOfWork.Departments.FirstOrDefaultAsync(d => d.Id == request.DepartmentId && d.CompanyId == companyId);
        if (newDepartment == null)
        {
            return BadRequest(new { message = "Target department not found or does not belong to your company." });
        }

        var oldValue = new { user.Id, user.Email, user.IsActive, user.DepartmentId, user.RoleId };

        user.DepartmentId = request.DepartmentId;
        user.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        var newValue = new { user.Id, user.Email, user.IsActive, user.DepartmentId, user.RoleId };

        await _auditLogger.LogAsync(
            userId: GetAppUserId(),
            action: "STAFF_REASSIGNED",
            entityType: "User",
            entityId: user.Id,
            oldValue: oldValue,
            newValue: newValue
        );

        return Ok(new { message = "Staff member reassigned successfully." });
    }
}

public class HiringManagerPickerDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
}
