namespace RecruitmentPlatform.Core.Entities;

public class Company
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Industry { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? LogoUrl { get; set; }
    public string? Address { get; set; }
    public string SubscriptionStatus { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Department> Departments { get; set; } = new List<Department>();
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<UserInvitation> UserInvitations { get; set; } = new List<UserInvitation>();
}