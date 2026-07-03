namespace RecruitmentPlatform.Core.Entities;

public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<UserInvitation> UserInvitations { get; set; } = new List<UserInvitation>();
}