namespace RecruitmentPlatform.Core.Entities;

public class AuditLog
{
    public long Id { get; set; }
    public int? UserId { get; set; }
    public string Action { get; set; } = null!;
    public string? EntityType { get; set; }
    public int? EntityId { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime OccurredAt { get; set; }

    public virtual User? User { get; set; }
}