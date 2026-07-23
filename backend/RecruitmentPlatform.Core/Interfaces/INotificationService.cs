namespace RecruitmentPlatform.Core.Interfaces;

public interface INotificationService
{
    Task SendAsync(int recipientId, string type, string title, string body, string? relatedEntityType = null, int? relatedEntityId = null);
    Task SendEmailAsync(string toEmail, string subject, string htmlBody);
}