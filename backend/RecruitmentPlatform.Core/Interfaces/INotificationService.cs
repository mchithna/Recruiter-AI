namespace RecruitmentPlatform.Core.Interfaces;

public interface INotificationService
{
    Task SendAsync(int userId, string message);
    Task SendEmailAsync(string toEmail, string subject, string htmlBody);
}