using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class SmsNotificationService : INotificationService
{
    public Task SendAsync(int userId, string message)
    {
        Console.WriteLine($"SMS notification to user {userId}: {message}");
        return Task.CompletedTask;
    }
}