namespace RecruitmentPlatform.Core.Interfaces;

public interface INotificationService
{
    Task SendAsync(int userId, string message);
}