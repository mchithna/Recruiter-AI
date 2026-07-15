using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Core.DTOs;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;
using System.Security.Claims;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/departments")]
[Authorize(Roles = "Admin")]
public class DepartmentsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public DepartmentsController(IUnitOfWork unitOfWork)
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
    public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetAll()
    {
        var companyId = GetCompanyId();
        
        var companyDepartments = await _unitOfWork.Departments.FindAsync(d => d.CompanyId == companyId);

        var dtos = companyDepartments.Select(d => new DepartmentDto
        {
            Id = d.Id,
            ParentId = d.ParentId,
            Name = d.Name
        });

        return Ok(dtos);
    }

    [HttpPost]
    public async Task<ActionResult<DepartmentDto>> Create(CreateDepartmentDto createDto)
    {
        var companyId = GetCompanyId();

        if (createDto.ParentId.HasValue)
        {
            var parent = await _unitOfWork.Departments.GetByIdAsync(createDto.ParentId.Value);
            if (parent == null || parent.CompanyId != companyId)
            {
                return BadRequest("Invalid parent department.");
            }
        }

        var department = new Department
        {
            CompanyId = companyId,
            ParentId = createDto.ParentId,
            Name = createDto.Name
        };

        await _unitOfWork.Departments.AddAsync(department);
        await _unitOfWork.SaveChangesAsync();

        var dto = new DepartmentDto
        {
            Id = department.Id,
            ParentId = department.ParentId,
            Name = department.Name
        };

        return CreatedAtAction(nameof(GetAll), new { id = department.Id }, dto); // Standard created response
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DepartmentDto>> Update(int id, UpdateDepartmentDto updateDto)
    {
        var companyId = GetCompanyId();
        var department = await _unitOfWork.Departments.GetByIdAsync(id);

        if (department == null || department.CompanyId != companyId)
        {
            return NotFound("Department not found.");
        }

        if (updateDto.ParentId.HasValue && updateDto.ParentId != department.ParentId)
        {
            var newParent = await _unitOfWork.Departments.GetByIdAsync(updateDto.ParentId.Value);
            if (newParent == null || newParent.CompanyId != companyId)
            {
                return BadRequest("Invalid parent department.");
            }

            // Check for cycles: walk up the new parent's ancestor chain
            var currentAncestor = newParent;
            while (currentAncestor != null)
            {
                if (currentAncestor.Id == department.Id)
                {
                    return BadRequest("Cannot set a descendant as the parent department.");
                }

                if (currentAncestor.ParentId.HasValue)
                {
                    currentAncestor = await _unitOfWork.Departments.GetByIdAsync(currentAncestor.ParentId.Value);
                }
                else
                {
                    currentAncestor = null;
                }
            }
        }

        department.Name = updateDto.Name;
        department.ParentId = updateDto.ParentId;

        _unitOfWork.Departments.Update(department);
        await _unitOfWork.SaveChangesAsync();

        var dto = new DepartmentDto
        {
            Id = department.Id,
            ParentId = department.ParentId,
            Name = department.Name
        };

        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var companyId = GetCompanyId();
        var department = await _unitOfWork.Departments.GetByIdAsync(id);

        if (department == null || department.CompanyId != companyId)
        {
            return NotFound("Department not found.");
        }

        var children = await _unitOfWork.Departments.FindAsync(d => d.ParentId == id);
        if (children.Any())
        {
            return BadRequest("Please remove sub-departments and reassign staff before deleting this department.");
        }

        var users = await _unitOfWork.Users.FindAsync(u => u.DepartmentId == id);
        if (users.Any())
        {
            return BadRequest("Please remove sub-departments and reassign staff before deleting this department.");
        }

        _unitOfWork.Departments.Delete(department);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}
