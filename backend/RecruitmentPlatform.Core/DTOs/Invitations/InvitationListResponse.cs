namespace RecruitmentPlatform.Core.DTOs.Invitations;

public class InvitationListResponse
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string RoleName { get; set; } = null!;
    public string? DepartmentName { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
}
