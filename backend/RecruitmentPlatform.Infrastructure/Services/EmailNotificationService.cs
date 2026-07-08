using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class EmailNotificationService : INotificationService
{
    public Task SendAsync(int userId, string message)
    {
        Console.WriteLine($"Email notification to user {userId}: {message}");
        return Task.CompletedTask;
    }
}