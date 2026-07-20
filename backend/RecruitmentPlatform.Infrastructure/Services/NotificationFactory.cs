using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class NotificationFactory : INotificationFactory
{
    private readonly EmailNotificationService _emailNotificationService;

    public NotificationFactory(EmailNotificationService emailNotificationService)
    {
        _emailNotificationService = emailNotificationService;
    }

    public INotificationService Create(string channel)
    {
        if (channel.Equals("Email", StringComparison.OrdinalIgnoreCase))
        {
            return _emailNotificationService;
        }

        throw new NotImplementedException($"The notification channel '{channel}' is not implemented yet.");
    }
}
