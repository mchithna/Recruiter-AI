namespace RecruitmentPlatform.Core.Entities;

public class CalendarIntegration
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Provider { get; set; } = null!;
    public string AccessTokenEncrypted { get; set; } = null!;
    public string? RefreshTokenEncrypted { get; set; }
    public DateTime? TokenExpiresAt { get; set; }
    public string? CalendarId { get; set; }
    public DateTime ConnectedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}