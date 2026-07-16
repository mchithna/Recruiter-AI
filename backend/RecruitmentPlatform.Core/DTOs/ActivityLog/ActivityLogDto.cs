namespace RecruitmentPlatform.Core.DTOs.ActivityLog;

public class ActivityLogDto
{
    public int Id { get; set; }
    public string? ActorFirstName { get; set; }
    public string? ActorLastName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public DateTime OccurredAt { get; set; }
}

public class ActivityLogPagedResponseDto
{
    public IEnumerable<ActivityLogDto> Items { get; set; } = new List<ActivityLogDto>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
