namespace RecruitmentPlatform.Core.DTOs;

public class DepartmentDto
{
    public int Id { get; set; }
    public int? ParentId { get; set; }
    public string Name { get; set; } = null!;
}
