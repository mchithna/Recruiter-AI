using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class NotificationFactory : INotificationFactory
{
    private readonly InAppNotificationService _inAppService;
    private readonly EmailNotificationService _emailService;
    private readonly CompositeNotificationService _compositeService;

    public NotificationFactory(
        InAppNotificationService inAppService,
        EmailNotificationService emailService,
        CompositeNotificationService compositeService)
    {
        _inAppService = inAppService;
        _emailService = emailService;
        _compositeService = compositeService;
    }

    public INotificationService Create(string channel)
    {
        return channel.ToLowerInvariant() switch
        {
            "inapp" => _inAppService,
            "email" => _emailService,
            "all" or "composite" => _compositeService,
            _ => _inAppService // Default fallback
        };
    }
}
