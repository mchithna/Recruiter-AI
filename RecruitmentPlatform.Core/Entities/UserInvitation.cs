namespace RecruitmentPlatform.Core.Entities;

public class UserInvitation
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int InvitedBy { get; set; }
    public string Email { get; set; } = null!;
    public int RoleId { get; set; }
    public int? DepartmentId { get; set; }
    public string InvitationTokenHash { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public virtual Company Company { get; set; } = null!;
    public virtual User InvitedByUser { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;
    public virtual Department? Department { get; set; }
}