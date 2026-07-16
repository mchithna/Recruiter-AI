namespace RecruitmentPlatform.Core.DTOs.Invitations;

public class CreateInvitationResponse
{
    public int InvitationId { get; set; }
    public string Email { get; set; } = null!;
    public string RoleName { get; set; } = null!;
    public string? DepartmentName { get; set; }
    public string AcceptUrl { get; set; } = null!;
}
