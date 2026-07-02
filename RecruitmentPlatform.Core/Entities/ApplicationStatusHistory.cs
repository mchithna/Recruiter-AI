namespace RecruitmentPlatform.Core.Entities;

public class ApplicationStatusHistory
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public int ChangedBy { get; set; }
    public string? OldStatus { get; set; }
    public string NewStatus { get; set; } = null!;
    public string? Notes { get; set; }
    public DateTime ChangedAt { get; set; }

    public virtual Application Application { get; set; } = null!;
    public virtual User ChangedByUser { get; set; } = null!;
}