using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Core.DTOs.Staff;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class StaffController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public StaffController(IUnitOfWork unitOfWork)
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

    [HttpPut("{userId}/deactivate")]
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

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Staff member deactivated successfully." });
    }

    [HttpPut("{userId}/reactivate")]
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

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Staff member reactivated successfully." });
    }

    [HttpPut("{userId}/reassign-department")]
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

        user.DepartmentId = request.DepartmentId;
        user.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Staff member reassigned successfully." });
    }
}
