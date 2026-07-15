using System.ComponentModel.DataAnnotations;

namespace RecruitmentPlatform.Core.DTOs;

public class UpdateCompanyDto
{
    [Required]
    public string Name { get; set; } = null!;
    public string? Industry { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? LogoUrl { get; set; }
    public string? Address { get; set; }
}
