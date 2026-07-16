namespace RecruitmentPlatform.Core.Interfaces;

public interface IAuditLogger
{
    Task LogAsync(int? userId, string action, string entityType, int? entityId, object? oldValue, object? newValue);
}
