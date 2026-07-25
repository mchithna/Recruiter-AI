using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class SmsNotificationService : INotificationService
{
    public Task SendAsync(int recipientId, string type, string title, string body, string? relatedEntityType = null, int? relatedEntityId = null)
    {
        Console.WriteLine($"SMS notification to user {recipientId}: [{type}] {title} - {body}");
        return Task.CompletedTask;
    }

    public Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        return Task.CompletedTask;
    }
}