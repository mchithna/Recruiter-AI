using System.ComponentModel.DataAnnotations;

namespace RecruitmentPlatform.Core.DTOs;

public class UpdateDepartmentDto
{
    [Required]
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
}
