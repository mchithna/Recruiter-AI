namespace RecruitmentPlatform.Core.Entities;

public class RolePermission
{
    public int RoleId { get; set; }
    public int PermissionId { get; set; }

    public virtual Role Role { get; set; } = null!;
    public virtual Permission Permission { get; set; } = null!;
}