namespace RecruitmentPlatform.Core.DTOs.Invitations;

public class CreateInvitationRequest
{
    public string Email { get; set; } = null!;
    public string RoleName { get; set; } = null!;
    public int? DepartmentId { get; set; }
}
