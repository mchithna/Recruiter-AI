namespace RecruitmentPlatform.Core.Entities;

public class Department
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int? ParentId { get; set; }
    public string Name { get; set; } = null!;

    public virtual Company Company { get; set; } = null!;
    public virtual Department? ParentDepartment { get; set; }
    public virtual ICollection<Department> ChildDepartments { get; set; } = new List<Department>();
    public virtual ICollection<Job> Jobs { get; set; } = new List<Job>();
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<UserInvitation> UserInvitations { get; set; } = new List<UserInvitation>();
}