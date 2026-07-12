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

        // Load roles manually if not loaded (or rely on lazy loading if configured)
        var roles = await _unitOfWork.Roles.GetAllAsync();

        var staffDtos = users.Select(u => new StaffDto
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email,
            RoleName = roles.FirstOrDefault(r => r.Id == u.RoleId)?.Name ?? "Unknown",
            IsActive = u.IsActive,
            DepartmentId = u.DepartmentId
        }).ToList();

        return Ok(staffDtos);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStaffStatusDto request)
    {
        var companyId = GetCompanyId();

        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == id && u.CompanyId == companyId);
        if (user == null)
        {
            return NotFound(new { message = "Staff member not found." });
        }

        // Optional: Prevent admin from deactivating themselves if that's a risk. 
        // Though Admin users shouldn't be in departments anyway based on the schema and plans.

        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Staff status updated successfully." });
    }

    [HttpPut("{id}/reassign")]
    public async Task<IActionResult> Reassign(int id, [FromBody] ReassignStaffDto request)
    {
        var companyId = GetCompanyId();

        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == id && u.CompanyId == companyId);
        if (user == null)
        {
            return NotFound(new { message = "Staff member not found." });
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

        return Ok(new { message = "Staff reassigned successfully." });
    }
}
