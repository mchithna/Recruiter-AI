using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Core.Factories;

public class NotificationFactory
{
    private readonly INotificationService _emailNotificationService;
    private readonly INotificationService _smsNotificationService;

    public NotificationFactory(
        INotificationService emailNotificationService,
        INotificationService smsNotificationService)
    {
        _emailNotificationService = emailNotificationService;
        _smsNotificationService = smsNotificationService;
    }

    public INotificationService Create(string type)
    {
        return type switch
        {
            "Email" => _emailNotificationService,
            "SMS" => _smsNotificationService,
            _ => throw new ArgumentException($"Unsupported notification type '{type}'.", nameof(type))
        };
    }
}